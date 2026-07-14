"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveRestoredAccountResult } from "@/lib/storage";

type Step = "email" | "code";

/**
 * Innlogging med e-post + engangskode (v2.4) -- for å hente fram et
 * tidligere lagret FULLVERSJON-resultat på en ny enhet/nettleser. Gjelder
 * kun fullversjonen (produkteiers eksplisitte krav): korttesten (50
 * spørsmål) tilbyr ingen lagring, se resultat/page.tsx.
 *
 * Ingen passord -- eierskap til e-postadressen ER innloggingen. Samme
 * endepunkt (/api/account/request-code) brukes uansett om det er første
 * gang eller ikke.
 */
export default function LoggInnPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/request-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Noe gikk galt. Prøv igjen.");
        return;
      }
      setInfo(`Vi har sendt en kode til ${email}. Sjekk innboksen din (og evt. søppelpost).`);
      setStep("code");
    } catch {
      setError("Fikk ikke kontakt med tjenesten. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/verify-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Feil kode. Prøv igjen.");
        return;
      }

      if (!data.hasSavedResult) {
        setInfo("Du er logget inn, men vi fant ikke noe lagret resultat på denne kontoen ennå.");
        return;
      }

      const resultRes = await fetch("/api/account/result");
      const resultData = await resultRes.json();
      if (!resultRes.ok) {
        setError(resultData.error ?? "Fant ikke det lagrede resultatet.");
        return;
      }

      saveRestoredAccountResult({
        factors: resultData.result.factors,
        facets: resultData.result.facets,
        o6Score: resultData.result.o6Score,
        savedAt: resultData.result.savedAt,
        // Eldre kontoresultater (før v2.11) har ikke dette feltet -- de kan
        // kun være "full", siden extended-tier ikke fantes den gangen.
        tier: resultData.result.tier === "extended" ? "extended" : "full",
      });
      router.push("/resultat");
    } catch {
      setError("Fikk ikke kontakt med tjenesten. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-ink dark:text-white">Logg inn</h1>
        <p className="text-ink/70 dark:text-warmgray/70">
          Hent fram et tidligere lagret resultat fra den fulle testen (120 spørsmål). Vi bruker
          ingen passord -- du logger inn med en kode vi sender til e-posten din.
        </p>
      </header>

      {step === "email" ? (
        <form onSubmit={requestCode} className="flex flex-col gap-3">
          <label htmlFor="login-email" className="text-sm font-medium text-ink dark:text-white">
            E-postadresse
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="navn@eksempel.no"
            className="rounded-lg border border-warmgray px-4 py-2 dark:border-white/20 dark:bg-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-teal px-5 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Sender kode …" : "Send meg en kode"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          {info && <p className="text-sm text-ink/70 dark:text-warmgray/70">{info}</p>}
          <label htmlFor="login-code" className="text-sm font-medium text-ink dark:text-white">
            6-sifret kode
          </label>
          <input
            id="login-code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="rounded-lg border border-warmgray px-4 py-2 tracking-[0.3em] dark:border-white/20 dark:bg-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-teal px-5 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Bekrefter …" : "Logg inn"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
              setInfo(null);
            }}
            className="text-sm text-ink/60 underline underline-offset-2 dark:text-warmgray/60"
          >
            Bruk en annen e-postadresse
          </button>
        </form>
      )}

      {error && <p className="text-sm text-coral">{error}</p>}

      <Link href="/" className="text-sm text-ink/60 underline underline-offset-2 dark:text-warmgray/60">
        Tilbake til forsiden
      </Link>
    </main>
  );
}
