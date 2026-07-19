"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveRestoredAccountResult } from "@/lib/storage";
import { ACCOUNT_SAVE_ENABLED } from "@/lib/featureFlags";

type Step = "checking" | "loggedIn" | "email" | "code";

/**
 * Innlogging med e-post + engangskode (v2.4) -- for å hente fram et
 * tidligere lagret FULLVERSJON-resultat på en ny enhet/nettleser, OG
 * (v2.28, kvalitetsrevisjon 19.07.2026) som eneste inngang til
 * admin-panelet. Gjelder resultatlagring kun fullversjonen (produkteiers
 * eksplisitte krav): korttesten (50 spørsmål) tilbyr ingen lagring, se
 * resultat/page.tsx.
 *
 * Ingen passord -- eierskap til e-postadressen ER innloggingen. Samme
 * endepunkt (/api/account/request-code) brukes uansett om det er første
 * gang eller ikke, og uansett om man logger inn for å hente et resultat
 * eller for å få admin-tilgang -- hvilken av delene som er relevante for
 * DEG avgjøres av hva kontoen din faktisk har (lagret resultat og/eller
 * admin-rolle), ikke av en egen "logg inn som admin"-vei.
 */
export default function LoggInnPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(ACCOUNT_SAVE_ENABLED ? "checking" : "email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!ACCOUNT_SAVE_ENABLED) return;
    fetch("/api/account/me")
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.loggedIn) {
          setStep("email");
          return;
        }
        setLoggedInEmail(data.email ?? null);
        // Kun for å vise en "Gå til adminpanel"-snarvei her -- selve
        // tilgangen håndheves uansett på nytt server-side i /admin.
        const settingsRes = await fetch("/api/admin/settings");
        setIsAdmin(settingsRes.ok);
        setStep("loggedIn");
      })
      .catch(() => setStep("email"));
  }, []);

  // Kontolagring er midlertidig satt på pause under betatesting (v2.16, se
  // lib/featureFlags.ts) -- vis en forklarende melding i stedet for
  // skjemaet, i tilfelle noen har denne siden bokmerket fra før.
  if (!ACCOUNT_SAVE_ENABLED) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-indigo dark:text-white">Logg inn</h1>
          <p className="text-indigo/70 dark:text-lavender-400/70">
            Innlogging og kontolagring er satt på pause under betatestingen -- vi jobber nå
            primært med språket i tilbakemeldingene og med Spir-samtalen. Vil du unngå å svare på
            alt på nytt etter en oppdatering, kan du i stedet laste ned svarene dine som en fil på
            resultatsiden, og laste den opp igjen senere.
          </p>
        </header>
        <Link href="/resultat" className="rounded-lg bg-holo-sky px-5 py-2.5 text-center font-medium text-white">
          Gå til resultatsiden
        </Link>
        <Link href="/" className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60">
          Tilbake til forsiden
        </Link>
      </main>
    );
  }

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

      setLoggedInEmail(data.email ?? email);
      const settingsRes = await fetch("/api/admin/settings");
      setIsAdmin(settingsRes.ok);

      if (!data.hasSavedResult) {
        setStep("loggedIn");
        setInfo("Du er logget inn, men vi fant ikke noe lagret resultat på denne kontoen ennå.");
        return;
      }

      await fetchSavedResult();
    } catch {
      setError("Fikk ikke kontakt med tjenesten. Sjekk nettforbindelsen og prøv igjen.");
      setLoading(false);
    }
  }

  async function fetchSavedResult() {
    setError(null);
    setLoading(true);
    try {
      const resultRes = await fetch("/api/account/result");
      const resultData = await resultRes.json();
      if (!resultRes.ok) {
        setError(resultData.error ?? "Fant ikke det lagrede resultatet.");
        setStep("loggedIn");
        return;
      }

      saveRestoredAccountResult({
        factors: resultData.result.factors,
        facets: resultData.result.facets,
        savedAt: resultData.result.savedAt,
        // Eldre kontoresultater (før v2.11) har ikke dette feltet -- de kan
        // kun være "full", siden extended-tier ikke fantes den gangen.
        tier: resultData.result.tier === "extended" ? "extended" : "full",
      });
      router.push("/resultat");
    } catch {
      setError("Fikk ikke kontakt med tjenesten. Sjekk nettforbindelsen og prøv igjen.");
      setStep("loggedIn");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/account/logout", { method: "POST" });
    } finally {
      setLoggedInEmail(null);
      setIsAdmin(false);
      setEmail("");
      setCode("");
      setInfo(null);
      setError(null);
      setStep("email");
      setLoading(false);
    }
  }

  if (step === "checking") return null;

  if (step === "loggedIn") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-indigo dark:text-white">Min konto</h1>
          <p className="text-indigo/70 dark:text-lavender-400/70">
            Du er logget inn som <span className="font-medium">{loggedInEmail}</span>.
          </p>
        </header>

        {info && <p className="text-sm text-indigo/70 dark:text-lavender-400/70">{info}</p>}
        {error && <p className="text-sm text-factor-stability">{error}</p>}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void fetchSavedResult()}
            disabled={loading}
            className="rounded-lg bg-holo-sky px-5 py-2.5 font-medium text-indigo disabled:opacity-50"
          >
            {loading ? "Henter …" : "Hent lagret resultat"}
          </button>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg border border-holo-skyText px-5 py-2.5 text-center font-medium text-holo-skyText"
            >
              Gå til adminpanel
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60"
          >
            Logg ut
          </button>
        </div>

        <Link href="/" className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60">
          Tilbake til forsiden
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-indigo dark:text-white">Logg inn</h1>
        <p className="text-indigo/70 dark:text-lavender-400/70">
          Hent fram et tidligere lagret resultat fra den fulle testen (120 spørsmål). Vi bruker
          ingen passord -- du logger inn med en kode vi sender til e-posten din.
        </p>
      </header>

      {step === "email" ? (
        <form onSubmit={requestCode} className="flex flex-col gap-3">
          <label htmlFor="login-email" className="text-sm font-medium text-indigo dark:text-white">
            E-postadresse
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="navn@eksempel.no"
            className="rounded-lg border border-lavender-400 px-4 py-2 dark:border-white/20 dark:bg-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-holo-sky px-5 py-2.5 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Sender kode …" : "Send meg en kode"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          {info && <p className="text-sm text-indigo/70 dark:text-lavender-400/70">{info}</p>}
          <label htmlFor="login-code" className="text-sm font-medium text-indigo dark:text-white">
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
            className="rounded-lg border border-lavender-400 px-4 py-2 tracking-[0.3em] dark:border-white/20 dark:bg-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-holo-sky px-5 py-2.5 font-medium text-white disabled:opacity-50"
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
            className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60"
          >
            Bruk en annen e-postadresse
          </button>
        </form>
      )}

      {error && <p className="text-sm text-factor-stability">{error}</p>}

      <Link href="/" className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60">
        Tilbake til forsiden
      </Link>
    </main>
  );
}
