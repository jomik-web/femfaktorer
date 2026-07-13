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

const BOOLEAN_KEYS: (keyof AdminSettings)[] = ["aiEnabled", "maintenanceMode"];
const STRING_KEYS: (keyof AdminSettings)[] = ["maintenanceMessage", "aiModel"];
const NUMBER_KEYS: (keyof AdminSettings)[] = ["aiMaxQuestionsPerSession", "aiGlobalQuestionCap"];

export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }
  const body = await request.json();
  const store = await readStore();
  const next = { ...store.settings };

  for (const key of BOOLEAN_KEYS) {
    if (typeof body[key] === "boolean") next[key] = body[key];
  }
  for (const key of STRING_KEYS) {
    if (typeof body[key] === "string") next[key] = body[key];
  }
  for (const key of NUMBER_KEYS) {
    if (typeof body[key] === "number" && body[key] >= 0) next[key] = body[key];
  }

  await writeStore({ ...store, settings: next });
  return NextResponse.json(next);
}
