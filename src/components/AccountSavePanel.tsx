"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ALL_QUESTIONS,
  ALL_QUESTIONS_EXTENDED,
  FREE_QUESTIONS,
  type Question,
} from "@/data/questions";
import {
  computeTestResult,
  computeFacetResults,
  type FactorResult,
  type FacetResult,
  type ResultTier,
} from "@/lib/scoring";
import { loadAnswers } from "@/lib/storage";
import { computeAccountResultExpiry } from "@/lib/account/types";
import { useFlags } from "@/components/FlagsProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Kontolagring av resultatet -- flyttet hit fra resultat/page.tsx i v2.44
 * (produkteiers ønske 31.07.2026). Bakgrunn: seksjonen lå midt i rapporten
 * og fylte mye plass med å forklare en funksjon som er SLÅTT AV under
 * betatestingen (RESULT_ACCOUNT_SAVE_ENABLED = false). Den hører hjemme
 * blant verktøyene, ikke i selve resultatet.
 *
 * Komponenten er bevisst SELVSTENDIG: den laster svarene og regner ut
 * resultatet på nytt selv, i stedet for å få dem inn som props. Det er hele
 * poenget med flyttingen -- panelet skal fungere på sin egen side, uten at
 * brukeren må stå på /resultat først.
 *
 * VIKTIG FOR SENERE: selve lagringsflyten (e-post -> engangskode -> lagre)
 * er uendret kode, men den er IKKE testet ende-til-ende etter flyttingen,
 * fordi flagget er av og flyten krever e-postutsending. Når du slår på
 * RESULT_ACCOUNT_SAVE_ENABLED igjen, test i denne rekkefølgen: (1) send kode,
 * (2) bekreft kode, (3) at resultatet faktisk lagres, (4) at "Lagre /
 * oppdater" virker for en allerede innlogget bruker, (5) logg ut.
 */

function questionSetForTier(tier: ResultTier): readonly Question[] {
  return tier === "extended" ? ALL_QUESTIONS_EXTENDED : tier === "full" ? ALL_QUESTIONS : FREE_QUESTIONS;
}

/**
 * Finner det HØYESTE fullførte nivået i denne nettleseren. Kontolagring
 * gjelder kun detaljerte rapporter (120/290) -- se `isDetailed` i
 * resultat/page.tsx, som denne bevisst speiler.
 */
function resolveSavableResult(): { tier: ResultTier; factors: FactorResult[]; facets: FacetResult[] } | null {
  const stored = loadAnswers();
  for (const tier of ["extended", "full"] as const) {
    const set = questionSetForTier(tier);
    const r = computeTestResult(stored.answers, set, tier);
    if (r.complete && r.factors) {
      return { tier, factors: r.factors, facets: computeFacetResults(stored.answers, set) };
    }
  }
  return null;
}

export function AccountSavePanel() {
  // v2.45: begge bryterne styres nå fra adminpanelet, se FlagsProvider.
  const { resultAccountSaveEnabled, betaAnswerSetToolsEnabled } = useFlags();
  const [hydrated, setHydrated] = useState(false);
  const [savable, setSavable] = useState<ReturnType<typeof resolveSavableResult>>(null);
  const [accountChecked, setAccountChecked] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveStep, setSaveStep] = useState<"closed" | "email" | "code">("closed");
  const [saveEmail, setSaveEmail] = useState("");
  const [saveCode, setSaveCode] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveInfo, setSaveInfo] = useState<string | null>(null);

  useEffect(() => {
    setSavable(resolveSavableResult());
    setHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/me")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setLoggedInEmail(data.loggedIn ? (data.email ?? null) : null);
        setAccountChecked(true);
      })
      .catch(() => {
        if (!cancelled) setAccountChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function requestSaveCode(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveInfo(null);
    setSaveLoading(true);
    try {
      const res = await fetch("/api/account/request-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: saveEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Noe gikk galt. Prøv igjen.");
        return;
      }
      setSaveInfo(`Vi har sendt en kode til ${saveEmail}.`);
      setSaveStep("code");
    } catch {
      setSaveError("Fikk ikke kontakt med tjenesten. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function persistCurrentResult() {
    if (!savable) return;
    setSaveLoading(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/account/save-result", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ factors: savable.factors, facets: savable.facets, tier: savable.tier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Klarte ikke å lagre resultatet.");
        return;
      }
      setSavedAt(data.savedAt);
      setSaveInfo("Resultatet ditt er lagret.");
    } catch {
      setSaveError("Fikk ikke kontakt med tjenesten. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function verifyAndSave(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveLoading(true);
    try {
      const res = await fetch("/api/account/verify-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: saveEmail, code: saveCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Feil kode. Prøv igjen.");
        return;
      }
      setLoggedInEmail(data.email ?? saveEmail);
      setSaveStep("closed");
      await persistCurrentResult();
    } catch {
      setSaveError("Fikk ikke kontakt med tjenesten. Sjekk nettforbindelsen og prøv igjen.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/account/logout", { method: "POST" });
    } catch {
      // se over -- fjerner den lokale innloggingsvisningen uansett
    }
    setLoggedInEmail(null);
    setSaveInfo(null);
  }

  const csvLink = betaAnswerSetToolsEnabled ? (
    <Link href="/verktoy/svardata" className="text-holo-skyText underline underline-offset-2">
      CSV-verktøyet
    </Link>
  ) : (
    "CSV-verktøyet"
  );

  // Pauset under betatestingen: da er hele lagringsflyten irrelevant, og vi
  // sier det rett ut i stedet for å vise et skjema som ikke gjør noe.
  if (!resultAccountSaveEnabled) {
    return (
      <section className="flex flex-col gap-3 rounded-lg border border-lavender-400 p-5 dark:border-white/20">
        <p className="text-sm font-semibold text-factor-stability">
          Denne funksjonen er satt på pause mens vi betatester.
        </p>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Under betatestingen endrer testen seg ofte, og da ville lagrede resultater fort blitt
          utdaterte. Bruk {csvLink} i stedet -- der laster du ned svarene dine som en fil og laster
          dem opp igjen etter en oppdatering, uten å svare på nytt.
        </p>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Når testen er ferdig, kan du lagre resultatet knyttet til e-postadressen din, så slipper
          du å ta testen på nytt for å se det igjen -- også fra en annen enhet. Vi lagrer da kun de
          ferdig beregnede skårene dine, aldri svarene, i inntil 12 måneder, og du kan slette det
          når som helst. Les mer i{" "}
          <Link href="/personvern#konto" className="text-holo-skyText underline underline-offset-2">
            personvernerklæringen
          </Link>
          .
        </p>
      </section>
    );
  }

  if (!hydrated || !accountChecked) return null;

  if (!savable) {
    return (
      <section className="flex flex-col gap-3 rounded-lg border border-lavender-400 p-5 dark:border-white/20">
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Du har ikke et fullført resultat å lagre ennå. Kontolagring gjelder Standard (120
          spørsmål) og Utvidet versjon (290 spørsmål).
        </p>
        <Link href="/test" className="text-sm text-holo-skyText underline underline-offset-2">
          Gå til testen
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-lavender-400 p-5 dark:border-white/20">
      <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
        Lagre resultatet knyttet til e-postadressen din, så slipper du å ta testen på nytt for å se
        det igjen -- også fra en annen enhet. Vi lagrer kun de ferdig beregnede skårene dine, aldri
        svarene, i inntil 12 måneder, og du kan slette det når som helst. Les mer i{" "}
        <Link href="/personvern#konto" className="text-holo-skyText underline underline-offset-2">
          personvernerklæringen
        </Link>
        .
      </p>

      {loggedInEmail ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
            Innlogget som {loggedInEmail}
            {savedAt ? ` -- sist lagret ${new Date(savedAt).toLocaleDateString("no-NO")}.` : "."}
          </p>
          {savedAt && (
            <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
              Slettes automatisk {computeAccountResultExpiry(savedAt).toLocaleDateString("no-NO")}{" "}
              med mindre du lagrer på nytt før den datoen. Vi sender deg en påminnelse på e-post
              omtrent en måned før.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" onClick={() => void persistCurrentResult()} disabled={saveLoading}>
              {saveLoading ? "Lagrer …" : "Lagre / oppdater resultatet"}
            </Button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="self-start text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60"
            >
              Logg ut
            </button>
          </div>
        </div>
      ) : saveStep === "closed" ? (
        <Button type="button" size="sm" onClick={() => setSaveStep("email")} className="self-start">
          Lagre resultatet mitt
        </Button>
      ) : saveStep === "email" ? (
        <form onSubmit={requestSaveCode} className="flex flex-col gap-2">
          <label htmlFor="save-email" className="text-sm font-medium text-indigo dark:text-white">
            E-postadresse
          </label>
          <Input
            id="save-email"
            type="email"
            required
            value={saveEmail}
            onChange={(e) => setSaveEmail(e.target.value)}
            placeholder="navn@eksempel.no"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={saveLoading}>
              {saveLoading ? "Sender kode …" : "Send meg en kode"}
            </Button>
            <button
              type="button"
              onClick={() => setSaveStep("closed")}
              className="text-sm text-indigo/60 underline underline-offset-2 dark:text-lavender-400/60"
            >
              Avbryt
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={verifyAndSave} className="flex flex-col gap-2">
          {saveInfo && <p className="text-sm text-indigo/70 dark:text-lavender-400/70">{saveInfo}</p>}
          <label htmlFor="save-code" className="text-sm font-medium text-indigo dark:text-white">
            6-sifret kode
          </label>
          <Input
            id="save-code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            value={saveCode}
            onChange={(e) => setSaveCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="tracking-[0.3em]"
          />
          <Button type="submit" size="sm" disabled={saveLoading} className="self-start">
            {saveLoading ? "Bekrefter …" : "Bekreft og lagre"}
          </Button>
        </form>
      )}

      {saveError && <p className="text-sm text-factor-stability">{saveError}</p>}
    </section>
  );
}
