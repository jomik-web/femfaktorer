"use client";

import { useEffect, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { buttonClassNames } from "@/components/ui/Button";
import { passkeyErrorMessage } from "@/lib/account/passkeyErrors";

/**
 * "Logg inn med passkey" (v2.47, 31.07.2026).
 *
 * Brukeren skriver ingen e-postadresse -- nettleseren finner selv fram
 * passkeyene den har for dette nettstedet og lar brukeren velge. Det er
 * derfor registreringen krever `residentKey: "required"`, se
 * api/account/passkey/register/options.
 *
 * Knappen skjules helt når nettleseren ikke støtter WebAuthn, i stedet for å
 * vises som noe som feiler når man trykker. Vi kan derimot IKKE vite på
 * forhånd om brukeren faktisk har registrert en passkey her -- å sjekke det
 * ville krevd at vi røpet hvilke kontoer som har passkeys, noe vi bevisst
 * ikke gjør. Derfor er teksten under knappen formulert slik at det ikke
 * oppleves som en feil å trykke uten å ha en.
 */
export function PasskeyLoginButton({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && typeof window.PublicKeyCredential !== "undefined");
  }, []);

  async function login() {
    setBusy(true);
    setError(null);
    try {
      const optionsRes = await fetch("/api/account/passkey/login/options", { method: "POST" });
      if (!optionsRes.ok) {
        setError("Klarte ikke starte innloggingen. Bruk e-postkode i stedet.");
        return;
      }
      const { options, challengeId } = await optionsRes.json();

      const response = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch("/api/account/passkey/login/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ response, challengeId }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(data.error ?? "Passkeyen ble ikke godkjent.");
        return;
      }
      onSuccess(data.email);
    } catch (err) {
      // Avbrudd og "ingen passkey å velge" gir null -- normale valg, ikke feil.
      setError(passkeyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void login()}
        className={`${buttonClassNames("secondary", "md")} disabled:opacity-40`}
      >
        {busy ? "Venter på enheten …" : "Logg inn med passkey"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
