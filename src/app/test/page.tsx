"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ALL_QUESTIONS,
  ALL_QUESTIONS_EXTENDED,
  FREE_QUESTIONS,
  FREE_TIER_LENGTH,
  type Question,
} from "@/data/questions";
import type { AnswerValue, FactorResult, FacetResult, ResultTier } from "@/lib/scoring";
import { computeTestResult, computeFacetResults, type AnswerMap } from "@/lib/scoring";
import {
  loadAnswers,
  saveAnswers,
  clearAnswers,
  archiveCurrentAnswersBeforeRetake,
  loadIntroSeen,
  saveIntroSeen,
  markTestStarted,
  resetTestStarted,
  loadResearchConsent,
  saveResearchConsent,
  loadResponseTimes,
  recordResponseTime,
  clearResponseTimes,
} from "@/lib/storage";
import { deviceCategory } from "@/lib/device";
import { trackEvent, trackEventOncePerSession, resetSessionEventGuards } from "@/lib/metrics/client";
import { loadTestDurationSeconds } from "@/lib/storage";
import { AnswerScale } from "@/components/AnswerScale";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/Button";
import { PageBackground } from "@/components/ui/PageBackground";
import { SpirQuizScene } from "@/components/SpirQuizScene";

/**
 * TRE-TRINNS TESTFLYT (v2.11, tredje trapp -- "Utvidet versjon"): de første
 * 50 spørsmålene gir et foreløpig resultat for de fem hovedfaktorene. Ved
 * spørsmål 50 stopper vi og spør -- på en smakfull, ikke pushy måte (jf.
 * Dokument 04 KORTRESULTAT-005/008) -- om brukeren vil fortsette til alle
 * 120 for et mer presist resultat og tilgang til Spir. Ved spørsmål 120
 * tilbys, på samme måte, et tredje og siste steg: alle 290 spørsmål (10 per
 * fasett i stedet for 4-5), kalt "Utvidet versjon" i grensesnittet.
 */

function questionsForTier(tier: ResultTier): readonly Question[] {
  if (tier === "extended") return ALL_QUESTIONS_EXTENDED;
  if (tier === "full") return ALL_QUESTIONS;
  return FREE_QUESTIONS;
}

/**
 * Sender de FERDIG BEREGNEDE skårene (ikke svarene) til det anonyme,
 * aggregerte normtelling-endepunktet -- v2.8, utvidet i v2.11 med en egen
 * pott per tier (se src/lib/stats/blobs.ts og personvernsiden). Kalles KUN
 * når brukeren har landet på sitt ENDELIGE nivå -- altså etter at
 * full-tier-sjekkpunktet er avklart (enten ved at de takker nei til å
 * fortsette, eller ved at de fullfører alle 290) -- IKKE automatisk ved
 * hvert 120-punkt, siden noen av dem fortsetter videre til 290 og da skal
 * telle i DEN potten i stedet. Bevisst "fire-and-forget": venter ikke på
 * svaret, blokkerer aldri navigasjonen, og feiler helt stille -- dette er
 * usynlig infrastruktur, ikke noe brukeren skal merke eller kunne se feile.
 */
function submitAnonymousNormStats(
  factors: FactorResult[],
  facets: FacetResult[],
  tier: "full" | "extended"
): void {
  void fetch("/api/stats/submit-norm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ factors, facets, tier }),
  }).catch(() => {
    // Stille -- se doc-kommentar over.
  });
}

/**
 * Sender det FULLSTENDIGE, anonyme svarsettet til /api/research/submit-answers
 * (v2.45, 31.07.2026) -- grunnlaget for senere leddstatistikk: svarfordeling
 * per spørsmål, ledd-total-korrelasjon og intern konsistens per fasett.
 *
 * Dette er noe helt annet enn normtellingen over, som bare sender ferdig
 * beregnede skårer. Her sendes svarene på hvert enkelt spørsmål -- og derfor
 * skjer det KUN når brukeren har latt avkrysningen på "Før du starter" stå
 * på. Se src/lib/research/types.ts for personverngrensen som gjelder for
 * disse dataene, og hvorfor de aldri kan knyttes til en konto.
 *
 * Merk at hverken uke, appversjon eller spørsmålssettversjon sendes herfra --
 * de settes på serveren, som vet bedre enn en klient hvilken utgave som
 * faktisk kjørte.
 *
 * "Fire-and-forget", som normtellingen: venter ikke, blokkerer ikke
 * navigasjonen, feiler helt stille.
 */
/** Tidsbruk i hele minutter, eller undefined om vi ikke vet. Se lib/metrics/types.ts. */
function durationMinutes(): number | undefined {
  const seconds = loadTestDurationSeconds();
  return seconds === null ? undefined : Math.round(seconds / 60);
}

function submitAnonymousAnswerSet(answers: AnswerMap, tier: "full" | "extended"): void {
  if (!loadResearchConsent()) return;
  void fetch("/api/research/submit-answers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tier,
      answers,
      responseMs: loadResponseTimes(),
      device: deviceCategory(),
    }),
  }).catch(() => {
    // Stille -- se doc-kommentar over.
  });
}

export default function TestPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [tier, setTier] = useState<ResultTier>("free");
  const [index, setIndex] = useState(0);
  // "afterFree" = sjekkpunktet ved 50 (tilbyr full), "afterFull" = sjekkpunktet
  // ved 120 (tilbyr utvidet versjon).
  const [checkpoint, setCheckpoint] = useState<"none" | "afterFree" | "afterFull">("none");
  const [hydrated, setHydrated] = useState(false);
  // v2.25: vises når brukeren havner på /test og allerede har et FERDIG
  // resultat fra før -- i stedet for å hoppe rett til /resultat uten
  // forvarsel (produkteiers rapporterte bug: "trykker test... går jeg rett
  // til resultatet"). Se hydreringen under.
  const [awaitingRetakeChoice, setAwaitingRetakeChoice] = useState(false);

  // "Før du starter"-veiledningen (v2.31, 19.07.2026) -- vises før noe annet
  // dersom brukeren ikke har sett den før på denne enheten. Inneholder kun
  // veiledning om hvordan man svarer, ingen bekreftelse kreves lenger (den
  // tidligere aldersbekreftelsen er fjernet på produkteiers ønske).
  const [introSeen, setIntroSeen] = useState(false);

  // Avkrysningen for anonym forskningsdata på "Før du starter"-skjermen
  // (v2.45). Huket av på forhånd etter produkteiers valg 31.07.2026 -- selve
  // verdien skrives til lagringen først når brukeren trykker "start testen",
  // se knappen lenger nede.
  const [researchConsent, setResearchConsent] = useState(true);

  const activeQuestions = questionsForTier(tier);

  // Last lagrede svar ved oppstart (autolagring, Dokument 09 §10.3).
  useEffect(() => {
    // Betaperioden (v2.37): starter klokken for tidsbruksmålingen som følger
    // med tilbakemeldingsskjemaet. Setter bare tidspunkt dersom økten ikke
    // allerede har ett, så en bruker som navigerer frem og tilbake mellom
    // /test og /resultat ikke nullstiller sin egen måling.
    markTestStarted();
    setIntroSeen(loadIntroSeen());
    const stored = loadAnswers();
    setAnswers(stored.answers);
    setTier(stored.tier);

    const list = questionsForTier(stored.tier);
    const firstUnanswered = list.findIndex((q) => stored.answers[q.id] === undefined);
    if (firstUnanswered === -1) {
      if (stored.tier === "free") {
        setCheckpoint("afterFree");
      } else if (stored.tier === "full") {
        setCheckpoint("afterFull");
      } else {
        // tier === "extended" og alt besvart -- ferdig avklart, vis
        // retake-skjermen i stedet for et stille hopp til /resultat.
        setAwaitingRetakeChoice(true);
      }
    } else {
      setIndex(firstUnanswered);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const question = activeQuestions[index];
  const total = activeQuestions.length;

  const firstUnansweredIndex = useMemo(
    () => activeQuestions.findIndex((q) => answers[q.id] === undefined),
    [answers, activeQuestions]
  );

  /**
   * Svartidsmåling (v2.45): klokken nullstilles hver gang et NYTT spørsmål
   * vises på skjermen, og leses av når spørsmålet besvares.
   *
   * Bevisst en ref og ikke state -- verdien skal ikke utløse ny opptegning,
   * og en state-oppdatering per spørsmål ville gitt 290 unødvendige
   * gjennomtegninger gjennom en full test.
   */
  const questionShownAtRef = useRef<number | null>(null);
  const currentQuestionId = activeQuestions[index]?.id;

  useEffect(() => {
    questionShownAtRef.current = currentQuestionId ? Date.now() : null;
  }, [currentQuestionId]);

  /**
   * Trakt-telling (v2.45): "startet testen" registreres først når et
   * spørsmål faktisk er på skjermen -- ikke når /test lastes. Forskjellen
   * betyr noe: den som lander på retake-skjermen eller på veiledningen og
   * ombestemmer seg, har ikke startet testen, og skal ikke telle som om de
   * gjorde det.
   */
  useEffect(() => {
    if (!hydrated || !introSeen || awaitingRetakeChoice) return;
    if (checkpoint !== "none" || !currentQuestionId) return;
    trackEventOncePerSession("test_started");
  }, [hydrated, introSeen, awaitingRetakeChoice, checkpoint, currentQuestionId]);

  /** Sjekkpunktene 50 og 120 -- de to stedene folk faktisk faller av. */
  useEffect(() => {
    if (checkpoint === "afterFree") trackEventOncePerSession("reached_checkpoint_50");
    if (checkpoint === "afterFull") trackEventOncePerSession("reached_checkpoint_120");
  }, [checkpoint]);

  /**
   * v2.25: brukt fra "Du har allerede et resultat"-skjermen og som en
   * sekundær utvei fra de to sjekkpunktskjermene ("i tilfelle man har trykket
   * ved en feiltakelse"). Arkiverer det gamle svarsettet FØR det nullstilles
   * -- se doc-kommentaren på `archiveCurrentAnswersBeforeRetake` i storage.ts.
   */
  function restartTest() {
    archiveCurrentAnswersBeforeRetake();
    clearAnswers();
    // Tidsbruken skal måles på nytt for det nye forsøket, ikke fra da
    // brukeren første gang kom inn i økten.
    resetTestStarted();
    markTestStarted();
    // Svartidene hørte til det forrige forsøket -- de ville gitt et
    // misvisende bilde om de ble blandet inn i det nye.
    clearResponseTimes();
    // Nytt forsøk skal telle som et nytt forsøk i trakten.
    resetSessionEventGuards();
    setAnswers({});
    setTier("free");
    setIndex(0);
    setCheckpoint("none");
    setAwaitingRetakeChoice(false);
  }

  if (!hydrated) return null;

  if (!introSeen) {
    return (
      <PageBackground>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12 text-center">
          <h1 className="font-display text-xl font-semibold text-indigo dark:text-white sm:text-2xl">
            Før du starter
          </h1>
          <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
            Litt om hvordan du svarer: bruk det første som faller deg inn, uten å tenke for lenge på
            hvert spørsmål -- det finnes ikke noe "riktig" svar å lete etter. Tenk på hvordan du
            vanligvis er på tvers av ulike sammenhenger (jobb, hjemme, sammen med venner), ikke bare
            hvordan du er akkurat i dag eller i én bestemt situasjon.
          </p>
          {/* Anonym forskningsdata (v2.45, 31.07.2026). Plassert her fordi
              dette er det eneste stedet i flyten der brukeren ikke er midt i
              noe -- spør vi underveis eller etterpå, blir det enten et
              avbrudd eller et spørsmål om noe som allerede har skjedd.
              Avkrysningen står på som standard, med teksten synlig ved siden
              av, ikke gjemt bak en lenke. */}
          <label className="mx-auto flex max-w-md cursor-pointer items-start gap-3 rounded-xl bg-white/50 p-4 text-left dark:bg-white/5">
            <input
              type="checkbox"
              checked={researchConsent}
              onChange={(e) => setResearchConsent(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-holo-sky"
            />
            <span className="text-xs text-indigo/70 dark:text-lavender-400/70">
              <span className="font-medium text-indigo dark:text-white">
                Bidra til å gjøre testen bedre
              </span>
              <br />
              Svarene dine lagres anonymt, uten navn, e-post eller noe annet som kan spores tilbake
              til deg, og brukes til å finne spørsmål som er dårlig formulert. Du kan ta testen som
              normalt selv om du fjerner haken.{" "}
              <Link href="/personvern" className="underline underline-offset-2">
                Les mer i personvernerklæringen
              </Link>
              .
            </span>
          </label>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              onClick={() => {
                saveResearchConsent(researchConsent);
                // Teller hvor mange som lar haken stå -- uten dette tallet
                // vet vi ikke om et tynt datasett skyldes lite trafikk eller
                // at folk aktivt reserverer seg.
                trackEvent(researchConsent ? "research_consented" : "research_declined");
                saveIntroSeen();
                setIntroSeen(true);
              }}
            >
              Jeg er klar -- start testen
            </Button>
          </div>
        </main>
      </PageBackground>
    );
  }

  if (awaitingRetakeChoice) {
    return (
      <PageBackground>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12 text-center">
          <h1 className="font-display text-xl font-semibold text-indigo dark:text-white sm:text-2xl">
            Du har allerede et resultat
          </h1>
          <p className="text-indigo/80 dark:text-lavender-400/80">
            Mente du å ta testen på nytt, eller vil du se resultatet du allerede har?
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button type="button" onClick={() => router.push("/resultat")}>
              Se resultatet mitt
            </Button>
            <Button type="button" variant="ghost" onClick={restartTest}>
              Ta testen på nytt
            </Button>
          </div>
        </main>
      </PageBackground>
    );
  }

  if (checkpoint === "afterFree") {
    return (
      <PageBackground>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12 text-center">
          <h1 className="font-display text-xl font-semibold text-indigo dark:text-white sm:text-2xl">
            Du har svart på de første {FREE_TIER_LENGTH} spørsmålene
          </h1>
          <p className="text-indigo/80 dark:text-lavender-400/80">
            Vil du se hva som ligger bak hovedtrekkene? Ved å fortsette til alle 120 spørsmål får du
            et mer presist resultat, og du låser opp muligheten til å snakke videre med Spir om det.
          </p>
          <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
            Resultatet ditt er ikke ufullstendig som beskrivelse av deg fordi du velger å stoppe her
            -- de resterende spørsmålene gir bare en mer detaljert måling.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              onClick={() => {
                setTier("full");
                saveAnswers(answers, "full");
                setCheckpoint("none");
                const nextIndex = ALL_QUESTIONS.findIndex((q) => answers[q.id] === undefined);
                setIndex(nextIndex === -1 ? 0 : nextIndex);
              }}
            >
              Fortsett til alle 120
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                trackEvent("completed_free");
                router.push("/resultat");
              }}
            >
              Behold det foreløpige resultatet
            </Button>
          </div>
          <button
            type="button"
            onClick={restartTest}
            className="self-center text-xs text-indigo/50 underline underline-offset-2 dark:text-lavender-400/50"
          >
            Trykket du hit ved en feiltakelse? Start testen helt på nytt
          </button>
        </main>
      </PageBackground>
    );
  }

  if (checkpoint === "afterFull") {
    return (
      <PageBackground>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-12 text-center">
          <h1 className="font-display text-xl font-semibold text-indigo dark:text-white sm:text-2xl">
            Du har svart på alle de 120 spørsmålene
          </h1>
          <p className="text-indigo/80 dark:text-lavender-400/80">
            Vil du gå enda dypere? Utvidet versjon stiller 10 spørsmål per underkategori i stedet for
            4-5, og gir dermed det mest presise resultatet Dine Fasetter kan tilby -- til sammen 290
            spørsmål.
          </p>
          <p className="text-sm text-indigo/60 dark:text-lavender-400/60">
            Resultatet ditt fra de 120 spørsmålene er ikke ufullstendig som beskrivelse av deg fordi
            du velger å stoppe her -- de resterende spørsmålene gir bare en enda sikrere måling.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              onClick={() => {
                setTier("extended");
                saveAnswers(answers, "extended");
                setCheckpoint("none");
                const nextIndex = ALL_QUESTIONS_EXTENDED.findIndex((q) => answers[q.id] === undefined);
                setIndex(nextIndex === -1 ? 0 : nextIndex);
              }}
            >
              Fortsett til Utvidet versjon (290)
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const result = computeTestResult(answers, ALL_QUESTIONS, "full");
                if (result.complete && result.factors) {
                  submitAnonymousNormStats(result.factors, computeFacetResults(answers, ALL_QUESTIONS), "full");
                  // Bare de 120 spørsmålene i `ALL_QUESTIONS` sendes inn her.
                  // `answers` kan inneholde flere id-er dersom brukeren har
                  // vært innom Utvidet versjon og gått tilbake -- serveren
                  // forkaster ukjente id-er, men vi sender ryddig fra start.
                  const answersForTier: AnswerMap = {};
                  for (const q of ALL_QUESTIONS) {
                    const value = answers[q.id];
                    if (value !== undefined) answersForTier[q.id] = value;
                  }
                  submitAnonymousAnswerSet(answersForTier, "full");
                  trackEvent("completed_full", { durationMinutes: durationMinutes() });
                }
                router.push("/resultat");
              }}
            >
              Behold resultatet fra de 120 spørsmålene
            </Button>
          </div>
          <button
            type="button"
            onClick={restartTest}
            className="self-center text-xs text-indigo/50 underline underline-offset-2 dark:text-lavender-400/50"
          >
            Trykket du hit ved en feiltakelse? Start testen helt på nytt
          </button>
        </main>
      </PageBackground>
    );
  }

  if (!question) return null;

  function handleAnswer(value: AnswerValue) {
    // Les av svartidsklokken FØR noe annet skjer -- se questionShownAtRef.
    // Endrer brukeren et tidligere svar, overskrives målingen, slik at det
    // er den siste, faktiske betenkningstiden som lagres.
    const shownAt = questionShownAtRef.current;
    if (shownAt !== null) {
      recordResponseTime(question!.id, Date.now() - shownAt);
    }

    const next: AnswerMap = { ...answers, [question!.id]: value };
    setAnswers(next);
    saveAnswers(next, tier);

    const result = computeTestResult(next, activeQuestions, tier);
    if (result.complete) {
      if (tier === "free") {
        setCheckpoint("afterFree");
      } else if (tier === "full") {
        setCheckpoint("afterFull");
      } else {
        // tier === "extended" -- brukerens endelige, mest presise nivå.
        submitAnonymousNormStats(
          result.factors ?? [],
          computeFacetResults(next, ALL_QUESTIONS_EXTENDED),
          "extended"
        );
        submitAnonymousAnswerSet(next, "extended");
        trackEvent("completed_extended", { durationMinutes: durationMinutes() });
        router.push("/resultat");
      }
      return;
    }

    // Automatisk fremdrift (besluttet v1.5): gå til neste, eller til første
    // ubesvarte dersom vi allerede er ved slutten av listen.
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      const firstGap = activeQuestions.findIndex((q) => next[q.id] === undefined);
      if (firstGap !== -1) setIndex(firstGap);
    }
  }

  function goBack() {
    if (index > 0) setIndex(index - 1);
  }

  function jumpToFirstUnanswered() {
    if (firstUnansweredIndex !== -1) setIndex(firstUnansweredIndex);
  }

  return (
    <PageBackground>
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-12">
        {/* v2.32: vises kun over ALLER FØRSTE spørsmål (ikke ved hvert
            spørsmål) -- setter stemningen idet spørsmålene starter, uten å ta
            opp fast vertikal plass gjennom alle 290 spørsmålene (samme
            avveining som SpirHero på /spir, se den filens filhode). */}
        {index === 0 && <SpirQuizScene className="mb-1" />}
        <ProgressBar current={index + 1} total={total} />

        {firstUnansweredIndex !== -1 && firstUnansweredIndex !== index && (
          <button
            type="button"
            onClick={jumpToFirstUnanswered}
            className="self-start text-sm text-holo-skyText underline underline-offset-2"
          >
            Hopp til første ubesvarte spørsmål
          </button>
        )}

        <div key={question.id} className="flex flex-col gap-6 rounded-2xl bg-white/60 p-6 shadow-sm dark:bg-white/5">
          <h1
            id="active-question-heading"
            className="font-display text-xl font-semibold text-indigo dark:text-white sm:text-2xl"
          >
            {question.textNo}
          </h1>
          <AnswerScale
            questionId={question.id}
            value={answers[question.id]}
            onAnswer={handleAnswer}
            questionHeadingId="active-question-heading"
          />
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={goBack} disabled={index === 0}>
            &larr; Tilbake
          </Button>
        </div>
      </main>
    </PageBackground>
  );
}
