"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ALL_QUESTIONS, ALL_QUESTIONS_EXTENDED, FREE_QUESTIONS, type Domain, type Question } from "@/data/questions";
import {
  computeTestResult,
  computeFacetResults,
  DOMAIN_TO_DISPLAY,
  type FactorResult,
  type FacetResult,
  type ResultTier,
  type DisplayFactor,
} from "@/lib/scoring";
import {
  loadAnswers,
  clearAnswers,
  loadRestoredAccountResult,
  clearRestoredAccountResult,
} from "@/lib/storage";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { ShareCard } from "@/components/ShareCard";
import {
  NON_DIAGNOSTIC_NOTICE,
  CRISIS_NOTICE,
  bandFor,
  buildClosingSynthesis,
} from "@/data/interpretations";
import {
  matchCombinationInsightsByDomain,
  matchFacetCombinationInsights,
  type CombinationInsight,
  type FacetCombinationInsight,
} from "@/data/combinationInsights";
import { type StoredAccountResult } from "@/lib/account/types";
import { useFlags } from "@/components/FlagsProvider";
import { trackEventOncePerSession } from "@/lib/metrics/client";
import { AnswerSetCsvPanel } from "@/components/AnswerSetCsvPanel";
import SpirMascot from "@/components/SpirMascot";
import { Button, buttonClassNames } from "@/components/ui/Button";
import { PageBackground } from "@/components/ui/PageBackground";
import { Disclosure } from "@/components/ui/Disclosure";
import { FreeTierResult } from "@/components/resultat/FreeTierResult";
import { DetailedResult } from "@/components/resultat/DetailedResult";
import { HistoryTable } from "@/components/resultat/HistoryTable";
import { TierUpgradeCta } from "@/components/resultat/TierUpgradeCta";

const DISPLAY_TO_DOMAIN: Record<DisplayFactor, Domain> = Object.fromEntries(
  (Object.entries(DOMAIN_TO_DISPLAY) as [Domain, DisplayFactor][]).map(([domain, display]) => [display, domain])
) as Record<DisplayFactor, Domain>;

// Bruker den delte buttonClassNames()-byggeren fra Button (variant="primary"
// size="md") -- Link kan ikke bruke <Button> direkte (den er en <button>),
// men skal se identisk ut. Var tidligere en lokal, duplisert konstant her --
// slått sammen med Button-komponentets egen kilde (kvalitetsrevisjon
// 2026-07-24) slik at fremtidige fargeendringer ikke må gjøres flere steder.
const PRIMARY_MD_LINK_CLASSES = buttonClassNames("primary", "md");

function questionSetForTier(tier: ResultTier): readonly Question[] {
  return tier === "extended" ? ALL_QUESTIONS_EXTENDED : tier === "full" ? ALL_QUESTIONS : FREE_QUESTIONS;
}

/**
 * v2.33 (produkteiers ønske 19.07.2026): "Resultat" i menyen har fått en
 * rapportvalg-undermeny (se SiteNav.tsx) som lenker til /resultat?tier=X --
 * denne siden må derfor kunne lese ?tier= reaktivt (useSearchParams), som i
 * Next sin App Router krever en Suspense-grense rundt komponenten som
 * faktisk bruker hooken.
 */
export default function ResultatPage() {
  return (
    <Suspense fallback={null}>
      <ResultatContent />
    </Suspense>
  );
}

function ResultatContent() {
  const searchParams = useSearchParams();
  // v2.46: de tre funksjonsbryterne styres nå fra adminpanelet i stedet for
  // å være konstanter låst ved bygg. Se components/FlagsProvider.tsx.
  const { accountSaveEnabled, resultAccountSaveEnabled, betaAnswerSetToolsEnabled } = useFlags();
  const [factors, setFactors] = useState<FactorResult[] | null>(null);
  const [facets, setFacets] = useState<FacetResult[]>([]);
  const [tier, setTier] = useState<ResultTier | null>(null);
  const [incomplete, setIncomplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  // Hvilken hovedkategori-"side" som vises for den fulle testen (v2.3,
  // produkteiers ønske om å dele opp rapporten i én side per hovedkategori
  // i stedet for alt på én lang side). v2.22: kan også være "summary" -- den
  // avsluttende profiloppsummeringen ("Hva betyr dette for deg") fikk sin
  // egen fane i stedet for å vises under HVER hovedkategori-fane (den forrige
  // plasseringen, utenfor factors.map() men fortsatt inni samme synlige
  // område, gjorde at den i praksis dukket opp uansett hvilken hovedkategori
  // som var valgt -- rapportert som "kommer etter hvert hovedkategori").
  const [activeFactor, setActiveFactor] = useState<DisplayFactor | "summary" | null>(null);
  // Sant når resultatet vises fra kontoen (etter innlogging på en enhet uten
  // lokale svar) i stedet for fra denne enhetens egne lagrede testsvar --
  // v2.4, se lib/storage.ts og /logg-inn.
  const [isRestored, setIsRestored] = useState(false);
  const [accountChecked, setAccountChecked] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  // v2.44: tilstanden for selve lagringsflyten (saveStep/saveEmail/saveCode/
  // saveLoading/saveError/saveInfo/savedAt) er flyttet til
  // components/AccountSavePanel.tsx sammen med skjemaet. `loggedInEmail` blir
  // igjen her fordi den fortsatt trengs til "Utvikling over tid"-seksjonen,
  // bunnteksten og handleDelete().
  // "Utvikling over tid" (v2.27) -- kun relevant for "extended" (Premium-
  // nivå, 290 spm), se lib/account/types.ts sin doc-kommentar for hvorfor
  // "full" (Standard) aldri bygger opp en flerpunkts-historikk.
  const [history, setHistory] = useState<StoredAccountResult[]>([]);
  // v2.33: hvilke av de tre rapportnivåene er faktisk fullført lokalt --
  // brukes til å skjule "fortsett til neste nivå"-oppfordringer når
  // brukeren allerede har fullført det neste nivået (bare ser på et
  // tidligere/kortere resultat via rapportvalg-menyen), og til å tilby en
  // lenke til det andre resultatet i stedet.
  const [unlockedTiers, setUnlockedTiers] = useState<Record<ResultTier, boolean>>({
    free: false,
    full: false,
    extended: false,
  });

  useEffect(() => {
    const stored = loadAnswers();

    setUnlockedTiers({
      free: computeTestResult(stored.answers, FREE_QUESTIONS, "free").complete,
      full: computeTestResult(stored.answers, ALL_QUESTIONS, "full").complete,
      extended: computeTestResult(stored.answers, ALL_QUESTIONS_EXTENDED, "extended").complete,
    });

    // v2.33: rapportvalg-menyen (SiteNav) lenker til /resultat?tier=X for et
    // FULLFØRT nivå -- siden svarene er kumulative (120-settet inneholder de
    // samme svarene som 50-settet, osv.), kan hvert nivås rapport beregnes
    // uavhengig fra det samme lagrede svarsettet. Ugyldig/ufullført
    // forespurt tier faller tilbake til det brukeren sist var inne i
    // testflyten (uendret oppførsel fra før v2.33).
    const requestedParam = searchParams.get("tier");
    const requestedTier: ResultTier | null =
      requestedParam === "free" || requestedParam === "full" || requestedParam === "extended"
        ? requestedParam
        : null;

    let chosenTier: ResultTier | null = null;
    let chosenFactors: FactorResult[] | null = null;

    if (requestedTier) {
      const r = computeTestResult(stored.answers, questionSetForTier(requestedTier), requestedTier);
      if (r.complete && r.factors) {
        chosenTier = requestedTier;
        chosenFactors = r.factors;
      }
    }
    if (!chosenTier) {
      const r = computeTestResult(stored.answers, questionSetForTier(stored.tier), stored.tier);
      if (r.complete && r.factors) {
        chosenTier = stored.tier;
        chosenFactors = r.factors;
      }
    }

    if (chosenTier && chosenFactors) {
      setFactors(chosenFactors);
      setTier(chosenTier);
      // Fasettskår (underkategorier) vises som EGEN LISTE/graf nå KUN for
      // Utvidet versjon (290, v2.33, produkteiers ønske) -- Standard (120)
      // skal ikke lenger vise underkategoriene enkeltvis. v2.36: Standard
      // beregner likevel fasettene sine internt nå, KUN for å kunne nevne de
      // tre mest utpregede underkategoriene ved navn i løpende tekst (se
      // buildTopFacetsMention i domainComposition.ts og guarden lenger ned i
      // denne filen som fortsatt skjuler selve Underkategorier-seksjonen for
      // "full").
      if (chosenTier === "extended") {
        setFacets(computeFacetResults(stored.answers, ALL_QUESTIONS_EXTENDED));
      } else if (chosenTier === "full") {
        setFacets(computeFacetResults(stored.answers, ALL_QUESTIONS));
      }

      setHydrated(true);
      return;
    }

    // Ingen fullført test lokalt -- prøv et resultat hentet fra kontoen
    // (v2.4). Lokale svar går ALLTID foran et hentet resultat dersom begge
    // finnes, slik at en fersk test aldri overskygges av gammel kontodata.
    const restored = loadRestoredAccountResult();
    if (restored) {
      setFactors(restored.factors);
      setFacets(restored.facets);
      setTier(restored.tier);
      setIsRestored(true);
      setHydrated(true);
      return;
    }

    setIncomplete(true);
    setHydrated(true);
  }, [searchParams]);

  // Sett første fane som aktiv så snart resultatet er klart.
  useEffect(() => {
    if (factors && !activeFactor) setActiveFactor(factors[0]?.factor ?? null);
  }, [factors, activeFactor]);

  /**
   * Trakt-telling (v2.46): "resultatet ble faktisk lest". Bevisst atskilt
   * fra fullføringstellingen i /test -- avstanden mellom de to tallene viser
   * hvor mange som kommer seg gjennom testen, men aldri ser hva de fikk ut
   * av den. Det er et helt annet problem enn frafall underveis, og krever
   * en helt annen løsning.
   */
  useEffect(() => {
    if (factors && factors.length > 0) trackEventOncePerSession("result_viewed");
  }, [factors]);

  // Sjekk innloggingsstatus -- kun relevant (og kun spurt om) for full/extended-
  // testen, se produkteiers krav om at korttesten ikke skal tilby lagring.
  useEffect(() => {
    if (!accountSaveEnabled || tier === "free" || tier === null) return;
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
  }, [tier]);

  // Hent lagret historikk for "Utvikling over tid" -- kun meningsfullt for
  // extended-tier (Premium), og kun når vi vet brukeren faktisk er logget inn.
  useEffect(() => {
    if (!resultAccountSaveEnabled || tier !== "extended" || !loggedInEmail) return;
    let cancelled = false;
    fetch("/api/account/result")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setHistory(Array.isArray(data.history) ? data.history : []);
      })
      .catch(() => {
        // Ikke kritisk -- seksjonen vises da bare ikke ennå.
      });
    return () => {
      cancelled = true;
    };
  }, [tier, loggedInEmail]);

  if (!hydrated) return null;

  if (incomplete || !factors) {
    return (
      <PageBackground>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-display text-xl font-semibold text-indigo dark:text-white">
            Vi fant ikke et fullført resultat
          </h1>
          <p className="text-indigo/70 dark:text-lavender-400/70">
            Det kan hende testen ikke er fullført ennå, eller at lagrede svar er slettet.
          </p>
          <Link href="/test" className={PRIMARY_MD_LINK_CLASSES}>
            Gå til testen
          </Link>
          {betaAnswerSetToolsEnabled && (
            <div className="mt-4 flex w-full flex-col items-center gap-3 border-t border-lavender-400 pt-6 dark:border-white/10">
              <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
                Har du tatt testen før og lastet ned svarene dine? Last dem opp for å se resultatet
                med én gang, uten å svare på nytt.
              </p>
              <AnswerSetCsvPanel afterImport="reload" hideDownload />
            </div>
          )}
        </main>
      </PageBackground>
    );
  }

  async function handleDelete() {
    // Er man innlogget, slett den lagrede kontodataen også -- "slett mine
    // data" skal bety alt, ikke bare det som ligger lokalt (v2.4).
    if (loggedInEmail) {
      try {
        await fetch("/api/account/delete", { method: "POST" });
        await fetch("/api/account/logout", { method: "POST" });
      } catch {
        // Fortsetter uansett med lokal sletting under.
      }
    }
    clearAnswers();
    clearRestoredAccountResult();
    window.location.href = "/";
  }

  // "full" og "extended" deler nesten hele den detaljerte visningen --
  // fasetter, samspill, kontolagring, PDF-nedlasting osv. Kun noen få steder
  // (spørsmålssett-valg ved beregning, og selve oppfordringsteksten nederst)
  // skiller genuint mellom de to nivåene, se resten av filen.
  const isDetailed = tier === "full" || tier === "extended";

  // v2.44: requestSaveCode / persistCurrentResult / verifyAndSave /
  // handleLogout er flyttet til components/AccountSavePanel.tsx sammen med
  // skjemaet de hørte til. Én reell atferdsendring fulgte med: den ferske
  // historikken som persistCurrentResult tidligere hentet inn igjen med én
  // gang (v2.27), oppdateres nå først ved neste besøk på /resultat -- siden
  // lagringen skjer på en annen side, finnes ikke "Utvikling over tid"-
  // tabellen på skjermen i det øyeblikket.

  // Kombinasjonsfunn (både hovedfaktor- og fasettnivå) gruppert etter hvilket
  // hoveddomene de skal vises under -- se plasseringsregelen i
  // data/combinationInsights.ts (samme domene -> der; ulike domener -> under
  // det som kommer sist i visningsrekkefølgen).
  //
  // v2.33 (produkteiers rapportnivå-krav): "Spennende samspill"-kortene og
  // fasett-samspill vises nå KUN for Utvidet versjon (290) -- Standard (120)
  // skal verken vise underkategorier eller kombinasjonsfunn, kun en penere,
  // mer utfyllende hovedkategori-tekst (se `useTabsUI`/`tier === "full"`
  // under i selve visningen).
  const showCombosCards = tier === "extended";
  const domainCombosByDomain: Map<Domain, CombinationInsight[]> = showCombosCards
    ? matchCombinationInsightsByDomain(factors, bandFor, DISPLAY_TO_DOMAIN)
    : new Map<Domain, CombinationInsight[]>();
  const facetCombosByDomain: Map<Domain, FacetCombinationInsight[]> = showCombosCards
    ? matchFacetCombinationInsights(facets, bandFor)
    : new Map<Domain, FacetCombinationInsight[]>();
  // Den avsluttende "Oppsummering"-fanen vises for BÅDE full og extended
  // (facets er tom for "full", så funksjonen faller naturlig tilbake til kun
  // domenenivå-samspill der -- se buildClosingSynthesis sin doc-kommentar).
  // `richCombos` gir en bredere oppsummering (flere trekk, flere
  // kombinasjonssetninger) på Utvidet-tieren, som har den mest presise
  // fasettdataen å bygge dette på -- se doc-kommentaren i interpretations.ts.
  const closing = isDetailed ? buildClosingSynthesis(factors, facets, { richCombos: tier === "extended" }) : null;
  // Gratis-tierens egen, korte "samlede" analyse (v2.33) -- egen, enklere
  // variant nederst på siden (ikke en fane, siden gratis-tieren ikke har
  // fane-navigasjon i utgangspunktet).
  const closingFree = tier === "free" && factors ? buildClosingSynthesis(factors, [], { skipCombos: true }) : null;

  return (
    <PageBackground>
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-6 py-12 print:max-w-none">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold text-indigo dark:text-white sm:text-3xl">
            Din profil
          </h1>
          {isDetailed && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pdfLoading}
              onClick={async () => {
                if (!factors || !tier) return;
                setPdfLoading(true);
                try {
                  // Lastes kun ved klikk (kvalitetsrevisjon 2026-07-24): jsPDF
                  // er en middels tung avhengighet som tidligere ble lastet
                  // for ALLE besøkende på resultatsiden via en statisk
                  // toppimport, selv de som aldri trykker denne knappen.
                  const { downloadResultPdf } = await import("@/lib/pdfReport");
                  await downloadResultPdf({ factors, facets, tier, closingText: closing?.text ?? null });
                } finally {
                  setPdfLoading(false);
                }
              }}
              className="print:hidden"
            >
              {pdfLoading ? "Lager PDF …" : "Last ned som PDF"}
            </Button>
          )}
        </div>
        {/* v2.64: KRISEHENVISNINGEN blir stående her, øverst og alltid synlig.
            v2.24-beslutningen (kvalitetsrevisjon 2026-07-24, høyt funn) var at
            den skal vises uansett skår -- den som trenger nummeret, skal ikke
            måtte lete etter det. Det er ikke et forbehold, det er en livline.

            Ikke-diagnostisk-forbeholdet er derimot flyttet NEDERST (produkteiers
            ønske etter betatest): det er en presisering av hva resultatet ikke
            er, og hører hjemme etter at man har lest det. De to sto tidligere
            sammen og ble derfor behandlet likt -- men de gjør ulike jobber. */}
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">{CRISIS_NOTICE}</p>
        {(tier === "free" || tier === "full" || tier === "extended") && (
          <Disclosure title="Mer om dette resultatnivået">
            {tier === "free" && (
              <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
                Dette er et foreløpig resultat, basert på de første 50 av 120 spørsmål.
              </p>
            )}
            {tier === "full" && (
              <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
                Basert på fullversjonen (alle 120 spørsmål).
              </p>
            )}
            {tier === "extended" && (
              <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
                Basert på Utvidet versjon (alle 290 spørsmål) -- det mest presise resultatet Dine Fasetter
                kan gi, med 10 spørsmål per underkategori i stedet for 4-5.
              </p>
            )}
          </Disclosure>
        )}
      </header>

      {/* v2.64: KORTSTOKKEN ØVERST. Lå tidligere nederst i DetailedResult som
          en ren deleseksjon. Betatesteren ba om "slides øverst for
          hovedpoengene om deg" og pekte på Chess.com sin analyse som modell:
          enkel oppsummering først, så dras du dypere. Kortene er allerede valgt
          ut fra det som stikker MEST ut i profilen (pickMemeCards sorterer på
          avstand fra midtpunktet), så de ER de tydeligste funnene.
          FLYTTET, ikke duplisert -- de vises kun her nå. */}
      <ShareCard factors={factors} facets={facets} />

      {tier === "free" && <FreeTierResult factors={factors} closingFree={closingFree} facets={facets} />}

      {isDetailed && (
        <DetailedResult
          factors={factors}
          facets={facets}
          tier={tier}
          activeFactor={activeFactor}
          setActiveFactor={setActiveFactor}
          closing={closing}
          domainCombosByDomain={domainCombosByDomain}
          facetCombosByDomain={facetCombosByDomain}
        />
      )}

      {isDetailed && (
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden sm:flex-row sm:items-start sm:gap-5">
          <SpirMascot expression="oppmuntrende" size={72} className="shrink-0" />
          <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <h2 className="font-display font-semibold text-indigo dark:text-white">Vil du utforske resultatet videre?</h2>
            <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
              Spir kan hjelpe deg å reflektere videre rundt resultatet ditt. Resultatet ditt sendes da
              til Anthropic (leverandøren av Spir) -- kun når du aktivt starter samtalen.
            </p>
            <Link href="/spir" className={`self-center ${PRIMARY_MD_LINK_CLASSES} sm:self-start`}>
              Snakk med Spir
            </Link>
          </div>
        </section>
      )}

      {/* v2.44: selve kontolagringen er flyttet til /verktoy/lagre-resultat --
          den lå tidligere som en full seksjon her, og fylte mye plass i
          rapporten med å forklare en funksjon som er avslått under
          betatestingen. Igjen står kun en henvisning, slik at brukere som
          leter etter den fortsatt finner veien. */}
      {accountSaveEnabled && isDetailed && accountChecked && (
        <section className="flex flex-col gap-2 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
          <h2 className="font-display font-semibold text-indigo dark:text-white">
            Ta vare på resultatet
          </h2>
          {isRestored && (
            <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
              Dette resultatet er hentet fra kontoen din.
            </p>
          )}
          <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
            Du kan lagre resultatet knyttet til e-postadressen din, eller laste ned svarene dine
            som en fil. Begge deler ligger under{" "}
            <Link href="/verktoy" className="text-holo-skyText underline underline-offset-2">
              Verktøy
            </Link>
            .
          </p>
        </section>
      )}

      {resultAccountSaveEnabled && tier === "extended" && loggedInEmail && <HistoryTable history={history} />}

      {/* v2.33: disse to oppfordringene skjules når brukeren allerede har
          fullført neste nivå (bare ser på et kortere resultat via
          rapportvalg-menyen) -- da tilbys en lenke til det andre, allerede
          ferdige resultatet i stedet for en "fortsett testen"-oppfordring
          som ikke gir mening lenger. */}
      {tier && <TierUpgradeCta tier={tier} unlockedTiers={unlockedTiers} />}

      {/* v2.64: ikke-diagnostisk-forbeholdet, flyttet hit fra toppen. */}
      <p className="border-t border-lavender-400 pt-6 text-sm text-indigo/60 dark:border-white/10 dark:text-lavender-400/60">
        {NON_DIAGNOSTIC_NOTICE}
      </p>

      {/* Betaperioden (v2.37) -- fjernes ved lansering, se FeedbackPrompt.tsx. */}
      <FeedbackPrompt />

      <footer className="flex flex-col items-start gap-2 border-t border-lavender-400 pt-6 text-sm dark:border-white/10 print:hidden">
        <p className="text-indigo/60 dark:text-lavender-400/60">
          {loggedInEmail
            ? "Svarene dine ligger i denne nettleseren, og et beregnet resultat er lagret på kontoen din."
            : "Svarene dine er lagret bare i denne nettleseren, ikke hos Dine Fasetter."}
        </p>
        <button type="button" onClick={() => void handleDelete()} className="text-factor-stability underline underline-offset-2">
          Slett mine data
        </button>
      </footer>
      </main>
    </PageBackground>
  );
}
