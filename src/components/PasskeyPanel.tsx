"use client";

import { useCallback, useEffect, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { buttonClassNames } from "@/components/ui/Button";
import { passkeyErrorMessage } from "@/lib/account/passkeyErrors";

/**
 * Registrerte passkeys for den innloggede kontoen (v2.47, 31.07.2026).
 *
 * Vises kun når man ALLEREDE er innlogget -- det er hele sikkerhetspoenget,
 * se lib/account/passkeys.ts. Panelet er derfor plassert på /logg-inn sin
 * "du er innlogget"-skjerm, ikke ved siden av selve innloggingsskjemaet.
 */

interface PasskeySummary {
  credentialId: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
}

/**
 * Foreslår et enhetsnavn ut fra nettleseren, slik at brukeren slipper å
 * finne på noe. Bevisst grovt: dette er en etikett i en liste, ikke data vi
 * skal analysere -- og en detaljert enhetsstreng ville vært mer
 * identifiserende enn formålet krever.
 */
function suggestDeviceLabel(): string {
  if (typeof navigator === "undefined") return "Denne enheten";
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android-enhet";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows-PC";
  return "Denne enheten";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function PasskeyPanel() {
  const [passkeys, setPasskeys] = useState<PasskeySummary[] | null>(null);
  const [supported, setSupported] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    // PublicKeyCredential finnes ikke i eldre nettlesere, og heller ikke på
    // usikre tilkoblinger. Da skjuler vi hele funksjonen i stedet for å
    // tilby en knapp som garantert feiler.
    setSupported(typeof window !== "undefined" && typeof window.PublicKeyCredential !== "undefined");
    void refresh();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/account/passkey");
      if (!res.ok) {
        setPasskeys([]);
        return;
      }
      const data = await res.json();
      setPasskeys(data.passkeys ?? []);
    } catch {
      setPasskeys([]);
    }
  }, []);

  async function register() {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const optionsRes = await fetch("/api/account/passkey/register/options", { method: "POST" });
      if (!optionsRes.ok) {
        setError("Klarte ikke starte registreringen. Prøv å logge inn på nytt.");
        return;
      }
      const { options, challengeId } = await optionsRes.json();

      // Her tar nettleseren over: Face ID, fingeravtrykk, PIN eller fysisk
      // nøkkel. Avbryter brukeren, kaster denne et unntak -- og det er ikke
      // en feil vi skal klage over.
      const response = await startRegistration({ optionsJSON: options });

      const verifyRes = await fetch("/api/account/passkey/register/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ response, challengeId, label: suggestDeviceLabel() }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(data.error ?? "Klarte ikke registrere passkeyen.");
        return;
      }
      setInfo("Enheten er registrert. Neste gang kan du logge inn uten kode på e-post.");
      await refresh();
    } catch (err) {
      setError(passkeyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(credentialId: string, label: string) {
    if (!window.confirm(`Fjerne "${label}"? Du kan alltid registrere den på nytt senere.`)) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/account/passkey", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ credentialId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke fjerne enheten.");
        return;
      }
      setPasskeys(data.passkeys ?? []);
    } catch {
      setError("Klarte ikke fjerne enheten.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-lavender-400 p-5 dark:border-white/15">
      <div>
        <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
          Logg inn uten kode
        </h2>
        <p className="mt-1 text-sm text-indigo/70 dark:text-lavender-400/70">
          Registrer denne enheten, så kan du bruke Face ID, fingeravtrykk eller PIN neste gang i
          stedet for å vente på en kode på e-post.
        </p>
      </div>

      {passkeys && passkeys.length > 0 && (
        <ul className="flex flex-col gap-2">
          {passkeys.map((p) => (
            <li
              key={p.credentialId}
              className="flex items-center justify-between gap-3 rounded-lg bg-white/50 px-4 py-2.5 dark:bg-white/5"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-sm text-indigo dark:text-white">{p.label}</span>
                <span className="text-xs text-indigo/45 dark:text-lavender-400/45">
                  Registrert {formatDate(p.createdAt)}
                  {p.lastUsedAt ? ` · sist brukt ${formatDate(p.lastUsedAt)}` : " · ikke brukt ennå"}
                </span>
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove(p.credentialId, p.label)}
                className="shrink-0 text-xs text-red-600 underline underline-offset-2 disabled:opacity-40 dark:text-red-400"
              >
                Fjern
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={() => void register()}
        className={`self-start ${buttonClassNames("secondary", "md")} disabled:opacity-40`}
      >
        {passkeys && passkeys.length > 0 ? "Registrer en enhet til" : "Registrer denne enheten"}
      </button>

      {info && <p className="text-sm text-emerald-700 dark:text-emerald-400">{info}</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <p className="text-xs text-indigo/45 dark:text-lavender-400/45">
        Engangskode på e-post fungerer fortsatt som før, og forsvinner ikke. Mister du enheten, er
        det den som slipper deg inn. Merk at en passkey er knyttet til nettadressen -- får siden et
        nytt domene senere, må enhetene registreres på nytt.
      </p>
    </section>
  );
}
