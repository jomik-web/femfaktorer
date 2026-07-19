/**
 * Admin-tilgangssjekk (v2.28, kvalitetsrevisjon 19.07.2026).
 *
 * Brukes av alle /api/admin/*-ruter (unntatt de nå avviklede
 * WebAuthn-endepunktene) til å avgjøre om DEN INNLOGGEDE brukeren (via den
 * vanlige e-post/kode-kontoøkten, lib/account/session.ts) har admin-rolle
 * (lib/admin/roles.ts). Én kontoøkt-mekanisme for alt -- ikke en egen
 * admin-spesifikk innlogging -- var nettopp poenget med omleggingen bort
 * fra passkeys.
 */
import { cookies } from "next/headers";
import { readSession, ACCOUNT_SESSION_COOKIE_NAME } from "@/lib/account/session";
import { isAdminEmail } from "@/lib/admin/roles";

/** Returnerer den innloggede admin-brukerens e-post, eller null hvis ikke innlogget/ikke admin. */
export async function requireAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCOUNT_SESSION_COOKIE_NAME)?.value;

  let session;
  try {
    session = await readSession(token);
  } catch {
    return null;
  }
  if (!session) return null;

  const isAdmin = await isAdminEmail(session.email);
  return isAdmin ? session.email : null;
}
