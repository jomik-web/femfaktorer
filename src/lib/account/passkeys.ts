/**
 * Passkeys (WebAuthn) som ALTERNATIV innloggingsmåte (v2.47, 31.07.2026).
 *
 * HISTORIKKEN ER VIKTIG Å KJENNE FØR DU ENDRER NOE HER.
 * Nettstedet hadde passkey-innlogging tidligere, og den ble fjernet i v2.28
 * fordi den hadde et kritisk hull: registreringsendepunktet var ÅPENT --
 * hvem som helst kunne registrert en passkey og blitt admin før produkteier
 * rakk det selv ("først til mølla"). Restene ble slettet i v2.46.
 *
 * DENNE IMPLEMENTASJONEN LUKKER DET HULLET VED KONSTRUKSJON, ikke ved en
 * ekstra sjekk som kan glemmes: en passkey kan bare registreres FRA EN
 * ALLEREDE INNLOGGET ØKT (se api/account/passkey/register/*). Passkeyen
 * knyttes til den e-postadressen økten allerede tilhører -- den kan aldri
 * brukes til å opprette en konto eller kreve en adresse man ikke har bevist
 * at man eier via engangskode først. Det finnes altså ingen vei inn som
 * ikke går gjennom e-postbekreftelse minst én gang.
 *
 * ADMIN-ROLLEN ER FORTSATT HELT ATSKILT. En passkey gir ikke admin-tilgang.
 * Den logger deg inn som en e-postadresse; om DEN adressen har admin-rolle
 * avgjøres som før av lib/admin/roles.ts. Dette er samme prinsipp som
 * e-postkoden, og grunnen til at passkey ikke gjenåpner den gamle
 * angrepsflaten.
 *
 * E-POSTKODEN FORSVINNER ALDRI. En passkey ligger på enheten (den synkes
 * riktignok via iCloud Nøkkelring eller Google Passordbehandling). Uten en
 * annen vei inn ville et tapt enhetsoppsett betydd permanent utestenging.
 * Engangskode på e-post er derfor fortsatt den garanterte reserveveien, og
 * skal aldri fjernes til fordel for dette.
 *
 * DOMENEBINDING -- LES DETTE FØR DOMENEBYTTE. En passkey er kryptografisk
 * bundet til rpID, altså domenet. Passkeys registrert på
 * `<noe>.netlify.app` vil IKKE virke på et eget domene senere. Ved
 * domenebytte må alle registrere enhetene sine på nytt. Det er ikke noe vi
 * kan omgå -- det er hele sikkerhetsmekanismen som gjør passkeys
 * phishing-resistente.
 */
import { getStore } from "@netlify/blobs";
import { randomBytes } from "node:crypto";
import { normalizeEmail } from "@/lib/account/otp";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

/** Registrerte passkeys per konto. Nøkkel = normalisert e-post. */
function passkeyStore() {
  return getStore({ name: "femfaktorer-passkeys", consistency: "strong", ...manualConfig() });
}

/**
 * Omvendt oppslag: legitimasjons-id -> e-post.
 *
 * Nødvendig for innlogging UTEN at brukeren først skriver e-postadressen
 * sin. Nettleseren sender bare id-en til den passkeyen som ble valgt, og da
 * må vi kunne finne ut hvilken konto den hører til. Uten denne indeksen
 * måtte vi lest gjennom alle kontoer for hvert innloggingsforsøk.
 */
function passkeyIndexStore() {
  return getStore({ name: "femfaktorer-passkey-index", consistency: "strong", ...manualConfig() });
}

/** Kortlevde utfordringer. Se `storeChallenge` for hvorfor de må lagres server-side. */
function challengeStore() {
  return getStore({ name: "femfaktorer-passkey-challenges", consistency: "strong", ...manualConfig() });
}

export interface StoredPasskey {
  /** Legitimasjons-id, base64url. Unik på tvers av alle kontoer. */
  credentialId: string;
  /** Offentlig nøkkel, base64url. Kun den offentlige -- den private forlater aldri brukerens enhet. */
  publicKey: string;
  /**
   * Signaturteller fra autentikatoren. Brukes til å oppdage kloning: går
   * telleren nedover eller står stille der den skulle økt, er noe galt.
   * Merk at mange moderne passkeys (særlig synkroniserte) alltid rapporterer
   * 0 -- da gir telleren ingen beskyttelse, og det er forventet, ikke en feil.
   */
  counter: number;
  /** Hvordan autentikatoren kan nås ("internal", "hybrid", "usb" ...). Brukes som hint i nettleseren. */
  transports?: string[];
  /** Navn brukeren selv har gitt enheten, f.eks. "Mac Studio". */
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
}

/** Alle passkeys for en konto. Tom liste ved feil -- kaster aldri. */
export async function listPasskeys(email: string): Promise<StoredPasskey[]> {
  try {
    const stored = (await passkeyStore().get(normalizeEmail(email), { type: "json" })) as
      | StoredPasskey[]
      | null;
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

/** Hvilken konto en legitimasjons-id hører til, eller null. */
export async function emailForCredential(credentialId: string): Promise<string | null> {
  try {
    const email = (await passkeyIndexStore().get(credentialId, { type: "json" })) as string | null;
    return typeof email === "string" ? email : null;
  } catch {
    return null;
  }
}

/**
 * Lagrer en ny passkey og oppdaterer den omvendte indeksen.
 *
 * Rekkefølgen er med vilje: legitimasjonen skrives FØR indeksen. Feiler det
 * mellom de to, får vi en passkey som ikke kan brukes til innlogging uten
 * e-post -- irriterende, men trygt. Motsatt rekkefølge kunne gitt en indeks
 * som peker på noe som ikke finnes.
 */
export async function addPasskey(email: string, passkey: StoredPasskey): Promise<void> {
  const normalized = normalizeEmail(email);
  const existing = await listPasskeys(normalized);
  const next = [...existing.filter((p) => p.credentialId !== passkey.credentialId), passkey];
  await passkeyStore().setJSON(normalized, next);
  await passkeyIndexStore().setJSON(passkey.credentialId, normalized);
}

/** Oppdaterer teller og sist-brukt etter en vellykket innlogging. Beste innsats. */
export async function touchPasskey(email: string, credentialId: string, counter: number): Promise<void> {
  try {
    const normalized = normalizeEmail(email);
    const existing = await listPasskeys(normalized);
    const next = existing.map((p) =>
      p.credentialId === credentialId ? { ...p, counter, lastUsedAt: new Date().toISOString() } : p
    );
    await passkeyStore().setJSON(normalized, next);
  } catch {
    // Ikke kritisk -- innloggingen har uansett lyktes.
  }
}

/** Fjerner én passkey fra en konto, og dens oppføring i indeksen. */
export async function removePasskey(email: string, credentialId: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const existing = await listPasskeys(normalized);
  await passkeyStore().setJSON(
    normalized,
    existing.filter((p) => p.credentialId !== credentialId)
  );
  try {
    await passkeyIndexStore().delete(credentialId);
  } catch {
    // En foreldreløs indeksoppføring er ufarlig: oppslaget finner en konto,
    // men selve legitimasjonen er borte, og verifiseringen feiler da uansett.
  }
}

/** Hvor lenge en utfordring er gyldig. Kort med vilje -- den skal brukes umiddelbart. */
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export interface StoredChallenge {
  challenge: string;
  /** Satt ved registrering (vi vet hvem), tom ved innlogging (vi vet ennå ikke hvem). */
  email: string | null;
  type: "registration" | "authentication";
  expiresAt: number;
}

/**
 * Lagrer en utfordring server-side og returnerer id-en den ligger under.
 *
 * HVORFOR SERVER-SIDE: hele poenget med utfordringen er at serveren skal
 * kunne bevise at signaturen gjelder NETTOPP den tilfeldige verdien den selv
 * nettopp fant på. Lot vi klienten sende utfordringen tilbake sammen med
 * svaret, kunne en angriper valgt sin egen -- og da forsvinner beskyttelsen
 * mot at et gammelt, oppsnappet svar spilles av på nytt.
 */
export async function storeChallenge(
  challenge: string,
  type: StoredChallenge["type"],
  email: string | null
): Promise<string> {
  const id = randomBytes(24).toString("base64url");
  const record: StoredChallenge = {
    challenge,
    email: email ? normalizeEmail(email) : null,
    type,
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  };
  await challengeStore().setJSON(id, record);
  return id;
}

/**
 * Henter og SLETTER en utfordring. Engangsbruk -- en utfordring som er brukt
 * én gang skal aldri kunne brukes igjen, uansett utfall.
 */
export async function consumeChallenge(id: string | undefined): Promise<StoredChallenge | null> {
  if (!id) return null;
  try {
    const record = (await challengeStore().get(id, { type: "json" })) as StoredChallenge | null;
    // Slett først, deretter vurder gyldighet -- da er den borte også når den
    // var utløpt, og også hvis noe under feiler.
    await challengeStore().delete(id);
    if (!record) return null;
    if (Date.now() > record.expiresAt) return null;
    return record;
  } catch {
    return null;
  }
}

/**
 * rpID og forventet origin, utledet av NEXT_PUBLIC_SITE_URL.
 *
 * rpID må være selve vertsnavnet uten port og protokoll, mens origin er hele
 * adressen inkludert protokoll og eventuell port. Blandes de sammen, feiler
 * verifiseringen med en melding som er vanskelig å tolke -- derfor utledes
 * begge ett sted her.
 */
export function relyingParty(): {
  rpID: string;
  origin: string;
  rpName: string;
  /** Usant når NEXT_PUBLIC_SITE_URL mangler eller er ugyldig -- da er verdiene bare en gjetning. */
  configured: boolean;
} {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) {
    // v2.48: reservefallet beholdes så resten av appen ikke krasjer, men
    // `configured: false` gjør at kallstedene kan si klart fra i stedet for
    // å la nettleseren avvise med en uforståelig SecurityError.
    return { rpID: "localhost", origin: "http://localhost:3000", rpName: "Dine Fasetter", configured: false };
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { rpID: "localhost", origin: "http://localhost:3000", rpName: "Dine Fasetter", configured: false };
  }
  return {
    rpID: url.hostname,
    origin: url.origin,
    rpName: "Dine Fasetter",
    configured: true,
  };
}
