import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readStore, writeStore, type AdminSettings } from "@/lib/admin/store";
import { ADMIN_SESSION_COOKIE_NAME, isValidSessionCookieValue } from "@/lib/admin/session";

export const runtime = "nodejs";

async function requireSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return isValidSessionCookieValue(value);
}

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json(store.settings);
}

/**
 * MERK: dette var opprinnelig skrevet som en generisk løkke over nøkler
 * (BOOLEAN_KEYS/STRING_KEYS/NUMBER_KEYS), men TypeScript kan ikke bevise at
 * en verdi hentet dynamisk via `body[key]` faktisk matcher typen til den
 * SAMME `key` når den skrives til `next[key]` -- typen kollapser til `never`
 * ved skriving (kjent TS-begrensning for objekter med ulike felttyper).
 * Løsningen er eksplisitte, per-felt sjekker -- mer kode, men fullt
 * typesikkert og lettere å lese.
 */
export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }
  const body = (await request.json()) as Record<string, unknown>;
  const store = await readStore();
  const next: AdminSettings = { ...store.settings };

  if (typeof body.aiEnabled === "boolean") next.aiEnabled = body.aiEnabled;
  if (typeof body.maintenanceMode === "boolean") next.maintenanceMode = body.maintenanceMode;
  if (typeof body.maintenanceMessage === "string") next.maintenanceMessage = body.maintenanceMessage;
  if (typeof body.aiModel === "string") next.aiModel = body.aiModel;
  if (typeof body.aiMaxQuestionsPerSession === "number" && body.aiMaxQuestionsPerSession >= 0) {
    next.aiMaxQuestionsPerSession = body.aiMaxQuestionsPerSession;
  }
  if (typeof body.aiGlobalQuestionCap === "number" && body.aiGlobalQuestionCap >= 0) {
    next.aiGlobalQuestionCap = body.aiGlobalQuestionCap;
  }

  await writeStore({ ...store, settings: next });
  return NextResponse.json(next);
}
