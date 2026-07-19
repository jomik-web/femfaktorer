import { NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/admin/auth";
import { listAdminEmails, addAdminEmail, removeAdminEmail, BOOTSTRAP_ADMIN_EMAIL } from "@/lib/admin/roles";
import { isValidEmail, normalizeEmail } from "@/lib/account/otp";

export const runtime = "nodejs";

/**
 * Enkelt API for å administrere hvem som har admin-rolle. Ikke koblet til
 * noe grensesnitt ennå -- adminpanelets UI for dette designes i en egen
 * runde (se lib/admin/roles.ts). Alle tre metoder krever at kalleren selv
 * allerede er innlogget som admin.
 */

export async function GET() {
  if (!(await requireAdminEmail())) {
    return NextResponse.json({ error: "Ikke innlogget som admin." }, { status: 401 });
  }
  const emails = await listAdminEmails();
  return NextResponse.json({ admins: emails, bootstrapAdmin: BOOTSTRAP_ADMIN_EMAIL });
}

export async function POST(request: Request) {
  if (!(await requireAdminEmail())) {
    return NextResponse.json({ error: "Ikke innlogget som admin." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  if (!body || typeof body.email !== "string" || !isValidEmail(body.email.trim())) {
    return NextResponse.json({ error: "Skriv inn en gyldig e-postadresse." }, { status: 400 });
  }
  const result = await addAdminEmail(normalizeEmail(body.email));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ admins: await listAdminEmails() });
}

export async function DELETE(request: Request) {
  if (!(await requireAdminEmail())) {
    return NextResponse.json({ error: "Ikke innlogget som admin." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  if (!body || typeof body.email !== "string" || !isValidEmail(body.email.trim())) {
    return NextResponse.json({ error: "Skriv inn en gyldig e-postadresse." }, { status: 400 });
  }
  const result = await removeAdminEmail(normalizeEmail(body.email));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ admins: await listAdminEmails() });
}
