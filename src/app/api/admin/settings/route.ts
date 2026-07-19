import { NextResponse } from "next/server";
import { readStore, writeStore, type AdminSettings } from "@/lib/admin/store";
import { requireAdminEmail } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminEmail())) {
    return NextResponse.json({ error: "Ikke innlogget som admin." }, { status: 401 });
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
  if (!(await requireAdminEmail())) {
    return NextResponse.json({ error: "Ikke innlogget som admin." }, { status: 401 });
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
