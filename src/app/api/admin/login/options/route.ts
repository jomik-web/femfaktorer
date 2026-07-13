import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { readStore, writeStore } from "@/lib/admin/store";

export const runtime = "nodejs";

function getRpId(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL(siteUrl).hostname;
}

export async function GET() {
  const store = await readStore();
  if (!store.credential) {
    return NextResponse.json({ error: "Ingen admin-passkey er registrert ennå." }, { status: 400 });
  }

  const options = await generateAuthenticationOptions({
    rpID: getRpId(),
    userVerification: "preferred",
    allowCredentials: [
      { id: store.credential.credentialId, transports: store.credential.transports as never },
    ],
  });

  await writeStore({ ...store, currentChallenge: options.challenge });
  return NextResponse.json(options);
}
