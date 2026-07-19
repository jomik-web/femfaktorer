/**
 * Admin-roller (v2.28, kvalitetsrevisjon 19.07.2026).
 *
 * Erstatter den tidligere WebAuthn-passkey-baserte admin-innloggingen, som
 * hadde et kritisk sikkerhetshull: registreringsendepunktet var åpent for
 * HVEM SOM HELST fram til noen registrerte den første passkeyen ("først til
 * mølla") -- se OPPGAVER-FOR-PRODUKTEIER.md. Admin-tilgang styres nå i
 * stedet av HVILKEN E-POST som logger inn via den vanlige
 * e-post/engangskode-innloggingen (lib/account) -- ingen egen
 * registreringsflyt å kapre.
 *
 * BOOTSTRAP_ADMIN_EMAIL er hardkodet i kildekoden (ikke i lagringen) nettopp
 * for at det ALLTID skal finnes minst én admin, uansett lagringstilstand --
 * produkteier kan aldri bli låst ute slik det gamle systemet i praksis
 * kunne føre til.
 *
 * Ytterligere admins lagres i en enkel e-postliste i Netlify Blobs.
 * Produkteier kan legge til/fjerne flere admins via addAdminEmail/
 * removeAdminEmail -- selve admin-brukergrensesnittet for dette (en side der
 * man kan skrive inn en e-post og gi den admin-rolle) er ikke bygget ennå,
 * kommer i en egen runde. Funksjonene og et enkelt API (se
 * src/app/api/admin/roles/route.ts) er likevel på plass nå slik at det er
 * klart til å kobles på når UI-et er designet.
 */
import { getStore } from "@netlify/blobs";
import { normalizeEmail } from "@/lib/account/otp";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

function rolesStore() {
  return getStore({ name: "femfaktorer-admin-roles", consistency: "strong", ...manualConfig() });
}

const ROLES_KEY = "admin-emails";

/**
 * Fast, hardkodet bootstrap-admin -- alltid admin, uavhengig av lagret
 * rolleliste. Kan ikke fjernes via removeAdminEmail (se under).
 */
export const BOOTSTRAP_ADMIN_EMAIL = normalizeEmail("jomik.guldager@gmail.com");

async function readAdminEmails(): Promise<string[]> {
  try {
    const stored = (await rolesStore().get(ROLES_KEY, { type: "json" })) as string[] | null;
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

async function writeAdminEmails(emails: string[]): Promise<void> {
  await rolesStore().setJSON(ROLES_KEY, emails);
}

/** Alle admin-e-poster: den faste bootstrap-adminen + de som er lagt til i lagringen. */
export async function listAdminEmails(): Promise<string[]> {
  const stored = await readAdminEmails();
  return Array.from(new Set([BOOTSTRAP_ADMIN_EMAIL, ...stored]));
}

export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  if (normalized === BOOTSTRAP_ADMIN_EMAIL) return true;
  const stored = await readAdminEmails();
  return stored.includes(normalized);
}

export type AddAdminResult = { ok: true } | { ok: false; error: string };

/** Gir en e-postadresse admin-rolle. Kun ment kalt fra et allerede admin-gatet endepunkt. */
export async function addAdminEmail(email: string): Promise<AddAdminResult> {
  const normalized = normalizeEmail(email);
  if (!normalized) return { ok: false, error: "Ugyldig e-postadresse." };
  const stored = await readAdminEmails();
  if (normalized === BOOTSTRAP_ADMIN_EMAIL || stored.includes(normalized)) {
    return { ok: true }; // allerede admin -- idempotent
  }
  await writeAdminEmails([...stored, normalized]);
  return { ok: true };
}

export type RemoveAdminResult = { ok: true } | { ok: false; error: string };

/** Fjerner admin-rolle fra en e-postadresse. Bootstrap-adminen kan aldri fjernes herfra. */
export async function removeAdminEmail(email: string): Promise<RemoveAdminResult> {
  const normalized = normalizeEmail(email);
  if (normalized === BOOTSTRAP_ADMIN_EMAIL) {
    return { ok: false, error: "Denne kontoen er den faste admin-kontoen og kan ikke fjernes." };
  }
  const stored = await readAdminEmails();
  await writeAdminEmails(stored.filter((e) => e !== normalized));
  return { ok: true };
}
