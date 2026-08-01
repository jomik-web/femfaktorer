import { getStore } from "@netlify/blobs";
import {
  computeAccountResultExpiry,
  ACCOUNT_RESULT_REMINDER_DAYS_BEFORE,
  normalizeAccountHistory,
  type StoredAccountResult,
} from "../../src/lib/account/types";

/**
 * Planlagt (scheduled) Netlify-funksjon, v2.7. Kjører daglig og håndhever
 * 12-månedersgrensen for lagrede kontoresultater (Dokument 07-oppfølging,
 * produkteiers ønske: "automatisk sletting av lagrede kontoresultater etter
 * 12 måneder", med e-postpåminnelse cirka 30 dager før).
 *
 * VIKTIG -- egen fil, IKKE en del av Next.js-appen: Netlify bygger filer i
 * netlify/functions/ separat fra Next.js-appen (esbuild, ikke Next sin egen
 * bundler). Denne filen unngår derfor bevisst "@/..."-aliaser i
 * VERDI-importer (kun relative stier), siden esbuild ikke nødvendigvis
 * kjenner til tsconfig sine path-aliaser. Type-importer (`import type`)
 * er trygge uansett -- de fjernes helt før noe skal løses opp.
 *
 * Krever ingen ny miljøvariabel -- gjenbruker RESEND_API_KEY,
 * RESEND_FROM_ADDRESS, NEXT_PUBLIC_SITE_URL og (ev.) NETLIFY_BLOBS_SITE_ID/
 * NETLIFY_BLOBS_TOKEN, alle allerede dokumentert i .env.example.
 *
 * Netlify oppdager og planlegger denne funksjonen automatisk ut fra
 * `config.schedule` under -- ingen egen oppføring i netlify.toml er
 * nødvendig (se Netlifys dokumentasjon om "Scheduled Functions").
 */

function manualBlobsConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

function accountStore() {
  return getStore({ name: "femfaktorer-accounts", consistency: "strong", ...manualBlobsConfig() });
}

const RESEND_API_URL = "https://api.resend.com/emails";

async function sendRetentionReminderEmail(email: string, expiry: Date): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_ADDRESS;
  if (!apiKey || !from) return false;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://femfaktorer.no";
  const expiryText = expiry.toLocaleDateString("no-NO", { year: "numeric", month: "long", day: "numeric" });

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: email,
        subject: "Det lagrede FemFaktorer-resultatet ditt slettes snart",
        html:
          `<p>Hei,</p>` +
          `<p>Det lagrede testresultatet ditt hos FemFaktorer slettes automatisk <strong>${expiryText}</strong>, ` +
          `12 måneder etter at det sist ble lagret.</p>` +
          `<p>Vil du beholde tilgangen, logger du bare inn på nytt og lagrer resultatet igjen -- da starter ` +
          `en ny 12-månedersperiode: <a href="${siteUrl}/logg-inn">${siteUrl}/logg-inn</a></p>` +
          `<p>Vil du heller ta vare på resultatet slik det er nå, kan du logge inn og laste det ned som PDF ` +
          `før fristen.</p>` +
          `<p>Gjør du ingenting, slettes resultatet automatisk på datoen over, og kan ikke gjenopprettes.</p>`,
        text:
          `Hei,\n\nDet lagrede testresultatet ditt hos FemFaktorer slettes automatisk ${expiryText}, ` +
          `12 måneder etter at det sist ble lagret.\n\n` +
          `Vil du beholde tilgangen, logger du bare inn på nytt og lagrer resultatet igjen -- da starter ` +
          `en ny 12-månedersperiode: ${siteUrl}/logg-inn\n\n` +
          `Vil du heller ta vare på resultatet slik det er nå, kan du logge inn og laste det ned som PDF ` +
          `før fristen.\n\n` +
          `Gjør du ingenting, slettes resultatet automatisk på datoen over, og kan ikke gjenopprettes.`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * ---------------------------------------------------------------------------
 * OPPRYDDING I KORTLEVDE BUTIKKER (v2.50, kvalitetsrevisjon 01.08.2026,
 * funn 5.2)
 * ---------------------------------------------------------------------------
 *
 * To butikker skrev poster som ALDRI ble slettet:
 *
 *  - `femfaktorer-rate-limit`: én nøkkel per (bøtte, IP, tidsvindu). Så snart
 *    vinduet er passert kan verdien aldri leses igjen, men den ble liggende.
 *    Med syv bøtter og trafikk ville dette vokse i det uendelige.
 *  - `femfaktorer-passkey-challenges`: en utfordring slettes kun når den
 *    KONSUMERES. Hver gang en bruker avbryter Face ID-dialogen -- helt normal
 *    atferd, ikke misbruk -- blir posten liggende for alltid.
 *
 * Ingen av delene er farlige, men begge er kostnad og kvotebruk som vokser
 * uten tak, og de er usynlige helt til de ikke er det.
 *
 * Denne funksjonen kjørte allerede daglig for kontodataene, og har riktig
 * form for jobben. Feilene svelges bevisst per nøkkel: opprydding skal aldri
 * kunne velte selve retention-kjøringen, som er den viktige delen.
 */
const RATE_LIMIT_STORE_NAME = "femfaktorer-rate-limit";
const PASSKEY_CHALLENGE_STORE_NAME = "femfaktorer-passkey-challenges";

/**
 * Rate limit-nøkler har formen `<bøtte>:<ip>:<vindusindeks>`, der
 * vindusindeksen er `floor(tid / vinduslengde)`. Vi kjenner ikke
 * vinduslengden ut fra nøkkelen alene, så vi kan ikke regne oss tilbake til
 * et tidspunkt.
 *
 * Løsningen er å bruke selve blobbens metadata i stedet: Netlify Blobs
 * oppgir `etag` og størrelse, men ikke tidsstempel, så vi tar den enkle og
 * trygge veien -- vi sletter en nøkkel først når dens vindu ikke lenger kan
 * være i bruk uansett vinduslengde vi faktisk benytter. Den lengste
 * vinduslengden i koden er ett døgn (se lib/rateLimit.ts). En nøkkel hvis
 * vindusindeks tilsvarer et tidspunkt mer enn to døgn tilbake, kan derfor
 * ikke leses av noen. To døgn gir margin for det glidende vinduet, som ser
 * på forrige vindu i tillegg til inneværende.
 */
function isStaleRateLimitKey(key: string, now: number): boolean {
  const lastColon = key.lastIndexOf(":");
  if (lastColon === -1) return false;
  const windowIndex = Number.parseInt(key.slice(lastColon + 1), 10);
  if (!Number.isFinite(windowIndex) || windowIndex <= 0) return false;

  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
  // Prøv hver vinduslengde som faktisk brukes i koden, fra kortest til
  // lengst. Er nøkkelen for gammel for ALLE tolkninger, er den trygg å slette.
  const WINDOW_LENGTHS_MS = [60_000, 10 * 60_000, 15 * 60_000, 60 * 60_000, 24 * 60 * 60_000];
  return WINDOW_LENGTHS_MS.every((windowMs) => {
    const windowEnd = (windowIndex + 1) * windowMs;
    return now - windowEnd > TWO_DAYS_MS;
  });
}

async function sweepRateLimitKeys(): Promise<number> {
  let deleted = 0;
  try {
    const store = getStore({
      name: RATE_LIMIT_STORE_NAME,
      consistency: "strong",
      ...manualBlobsConfig(),
    });
    const now = Date.now();
    for await (const { blobs } of store.list({ paginate: true })) {
      for (const { key } of blobs) {
        if (!isStaleRateLimitKey(key, now)) continue;
        try {
          await store.delete(key);
          deleted += 1;
        } catch {
          // Prøv igjen neste kjøring.
        }
      }
    }
  } catch {
    // Butikken finnes kanskje ikke ennå (ingen trafikk). Ikke en feil.
  }
  return deleted;
}

async function sweepPasskeyChallenges(): Promise<number> {
  let deleted = 0;
  try {
    const store = getStore({
      name: PASSKEY_CHALLENGE_STORE_NAME,
      consistency: "strong",
      ...manualBlobsConfig(),
    });
    const now = Date.now();
    for await (const { blobs } of store.list({ paginate: true })) {
      for (const { key } of blobs) {
        let record: { expiresAt?: unknown } | null = null;
        try {
          record = (await store.get(key, { type: "json" })) as { expiresAt?: unknown } | null;
        } catch {
          continue;
        }
        // Utfordringen har eget utløpstidspunkt (5 minutter, se
        // lib/account/passkeys.ts). Poster uten gyldig felt er enten korrupte
        // eller fra et eldre format -- begge deler er trygge å fjerne.
        const expiresAt = typeof record?.expiresAt === "number" ? record.expiresAt : 0;
        if (expiresAt > now) continue;
        try {
          await store.delete(key);
          deleted += 1;
        } catch {
          // Prøv igjen neste kjøring.
        }
      }
    }
  } catch {
    // Butikken finnes kanskje ikke ennå.
  }
  return deleted;
}

export default async () => {
  const store = accountStore();
  const now = new Date();

  let deletedEntries = 0;
  let deletedAccounts = 0;
  let reminded = 0;
  let checked = 0;

  // v2.27: en konto lagrer nå en HISTORIKK av resultater (eldst -> nyest),
  // ikke bare ett -- se doc-kommentaren på normalizeAccountHistory() i
  // types.ts. Hvert element i historikken utløper UAVHENGIG av de andre,
  // 12 måneder etter sitt eget `savedAt` -- ikke etter historikkens siste
  // oppføring. Kontoen (hele nøkkelen) slettes først når historikken blir tom.
  for await (const { blobs } of store.list({ paginate: true })) {
    for (const { key } of blobs) {
      checked += 1;
      let raw: unknown = null;
      try {
        raw = await store.get(key, { type: "json" });
      } catch {
        continue; // Korrupt/utilgjengelig post -- rør den ikke, prøv igjen neste kjøring.
      }

      const history = normalizeAccountHistory(raw);
      if (history.length === 0) continue;

      let changed = false;
      const kept: StoredAccountResult[] = [];

      for (const entry of history) {
        const expiry = computeAccountResultExpiry(entry.savedAt);

        if (now >= expiry) {
          deletedEntries += 1;
          changed = true;
          continue; // denne oppføringen utgår -- tas ikke med videre
        }

        const reminderThreshold = new Date(expiry);
        reminderThreshold.setDate(reminderThreshold.getDate() - ACCOUNT_RESULT_REMINDER_DAYS_BEFORE);

        if (now >= reminderThreshold && !entry.reminderSentAt) {
          const sent = await sendRetentionReminderEmail(key, expiry);
          if (sent) {
            kept.push({ ...entry, reminderSentAt: now.toISOString() });
            changed = true;
            reminded += 1;
            continue;
          }
        }

        kept.push(entry);
      }

      if (!changed) continue;

      if (kept.length === 0) {
        try {
          await store.delete(key);
          deletedAccounts += 1;
        } catch {
          // Prøv igjen neste kjøring.
        }
      } else {
        try {
          await store.setJSON(key, kept);
        } catch {
          // Prøv igjen neste kjøring.
        }
      }
    }
  }

  const sweptRateLimit = await sweepRateLimitKeys();
  const sweptChallenges = await sweepPasskeyChallenges();

  return new Response(
    JSON.stringify({
      ok: true,
      checked,
      reminded,
      deletedEntries,
      deletedAccounts,
      sweptRateLimit,
      sweptChallenges,
    }),
    { headers: { "content-type": "application/json" } }
  );
};

export const config = { schedule: "@daily" };
