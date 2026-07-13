import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { readStore, writeStore } from "@/lib/admin/store";

export const runtime = "nodejs";

function getRpId(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL(siteUrl).hostname;
}

/**
 * Trinn 1 av passkey-registrering (kun mulig når det IKKE finnes en
 * registrert admin-credential ennå -- se §10.2: én admin-bruker, ikke et
 * fullt rollesystem. Etter første registrering skal dette endepunktet
 * avvises for å hindre at noen andre registrerer en ny nøkkel.)
 */
export async function GET() {
  const store = await readStore();
  if (store.credential) {
    return NextResponse.json(
      { error: "Admin-passkey er allerede registrert. Kontakt utvikler for å nullstille." },
      { status: 403 }
    );
  }

  const options = await generateRegistrationOptions({
    rpName: process.env.ADMIN_PASSKEY_RP_NAME || "FemFaktorer Admin",
    rpID: getRpId(),
    userName: "produkteier",
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  await writeStore({ ...store, currentChallenge: options.challenge });
  return NextResponse.json(options);
}
