"use client";

import { useEffect, useState } from "react";
import { APP_VERSION } from "@/lib/version";
import { loadTestDurationSeconds } from "@/lib/storage";
import { deviceCategory } from "@/lib/device";
import { buttonClassNames } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

/**
 * Tilbakemeldingsboks for betaperioden (v2.37, 31.07.2026).
 *
 * Plassert nederst på resultatsiden -- bevisst ETTER at brukeren har lest
 * profilen sin, ikke i bunnmenyen: engasjementet er på topp i det øyeblikket
 * de er ferdige med å lese, og faller bratt så snart de begynner å navigere
 * videre.
 *
 * v2.46: SKJEMAET ER FLYTTET FRA GOOGLE FORMS TIL NETTSTEDET SELV. Versjon,
 * enhet og tidsbruk følger automatisk med, tilbakemeldingene vises i
 * adminpanelet ved siden av tallene de handler om, og testeren blir værende
 * på siden -- hvert hopp til en ny fane koster svar.
 *
 * v2.51: OMBYGD TIL TRE STEG, etter produkteiers gjennomgang. Fire endringer,
 * hver med en grunn i metodelitteraturen:
 *
 *  1. FRITEKST ER IKKE LENGER OBLIGATORISK. Et åpent tekstfelt alene ganger
 *     frafallet i et skjema med omtrent 2,5, og hvert obligatorisk felt
 *     legger på 2-5 prosentpoeng. Obligatorisk fritekst var det dyreste
 *     enkeltvalget i forrige utgave. Nå er tallene obligatoriske og teksten
 *     frivillig -- motsatt av før.
 *
 *  2. ÉN KARAKTER PER OMRÅDE, OG HVER STARTER BLANK. Før delte alle områder
 *     én tilstandsvariabel, slik at karakteren fulgte med når man byttet
 *     område. Det er verre enn vanlig sekvensiell forankring (dokumentert til
 *     å feilvurdere rundt 13 % av svar i Likert-skalaer): en forhåndsutfylt
 *     verdi er en STANDARDVERDI som kan bli sendt inn uten at testeren har
 *     tatt stilling. `null` betyr her "ikke besvart", aldri "dårlig".
 *
 *  3. "BRUKTE DEN IKKE" I STEDET FOR "HAR IKKE EN MENING". Krosnick m.fl.
 *     (Public Opinion Quarterly, 2002) fant at "vet ikke"-alternativer ikke
 *     hever datakvaliteten -- de inviterer til å slippe unna tankearbeidet,
 *     særlig utover i skjemaet. Men en tester som aldri åpnet Spir har ikke
 *     "ingen mening", de har INGEN ERFARING. Ordlyden fanger derfor manglende
 *     eksponering uten å tilby en bekvem utvei for dem som faktisk mener noe.
 *
 *  4. SPRÅKET, TEKNISK OG LAYOUT HAR IKKE EGNE TALL. Prinsippet: tall er for
 *     det du vil følge over tid, fritekst er for det du vil fikse. "Layout
 *     3,8 av 5" er ikke handlingsrettet; "knappen var vanskelig å se på
 *     mobil" er det. De ligger derfor som eksempler i fritekstfeltet -- som
 *     nøytrale substantiver, ikke som ledende formuleringer, slik at de
 *     avgrenser omfanget uten å styre svaret.
 *
 * Tre steg er et bevisst kompromiss: ett spørsmål om gangen gir raskere
 * fullføring og foretrekkes av brukere, men hvert steg koster et trykk på
 * mobil, og samtaleformede skjemaer begynner å skade fullføring rundt 12-14
 * spørsmål. Tre ligger trygt under.
 *
 * Fortsatt anonymt: ingen e-post, intet navn, ingen IP. Det betyr også at du
 * ikke kan svare den som melder fra -- se blobs.ts for hva som skal til.
 *
 * HELE KOMPONENTEN ER MIDLERTIDIG. Når betaperioden avsluttes fjernes den
 * fra src/app/resultat/page.tsx, sammen med `markTestStarted`-kallene i
 * src/app/test/page.tsx og tidsbrukshjelperne i src/lib/storage.ts.
 */

/** Husker at det er gitt tilbakemelding PÅ DENNE VERSJONEN -- ny versjon spør på nytt. */
const FEEDBACK_GIVEN_STORAGE_KEY = "femfaktorer.tilbakemelding-gitt.v1";

type RatedArea = "testen" | "resultatet" | "spir";

interface Step {
  area: RatedArea;
  /** Spørsmålet, formulert så det måler ÉN ting -- se punkt om dobbeltspørsmål under. */
  question: string;
  /** Kort presisering av hva karakteren gjelder, slik at to testere vurderer det samme. */
  hint: string;
  low: string;
  high: string;
  /** Satt når området kan hoppes over fordi testeren kan mangle erfaring med det. */
  skipLabel?: string;
}

/**
 * "Resultatet" er presisert til TEKSTEN om deg, ikke "resultatet" generelt.
 * Uten presiseringen måler spørsmålet to ting samtidig (grafene og teksten),
 * og da gir skåren ett tall du ikke kan tolke etterpå -- det klassiske
 * dobbeltspørsmålet. Analyseteksten er produktet; grafene er innpakning.
 */
// `as const satisfies` gjør dette til en tuppel, ikke bare en liste: da vet
// TypeScript at STEPS[0] finnes, slik at fallbacken under ikke trenger en
// non-null-assertion (prosjektet kjører med noUncheckedIndexedAccess).
const STEPS = [
  {
    area: "testen",
    question: "Hvordan var det å ta selve testen?",
    hint: "Spørsmålene, lengden, hvor lett det var å svare.",
    low: "Slitsomt",
    high: "Helt greit",
  },
  {
    area: "resultatet",
    question: "Hvor godt traff teksten om deg?",
    hint: "Selve analysen -- kjente du deg igjen i beskrivelsen?",
    low: "Kjente meg ikke igjen",
    high: "Uhyggelig treffende",
  },
  {
    area: "spir",
    question: "Hvordan var samtalen med Spir?",
    hint: "AI-veilederen som svarer på spørsmål om resultatet ditt.",
    low: "Lite nyttig",
    high: "Veldig nyttig",
    skipLabel: "Brukte den ikke",
  },
] as const satisfies readonly Step[];

const LAST_STEP = STEPS.length;

export function FeedbackPrompt() {
  const [alreadyGiven, setAlreadyGiven] = useState(false);
  const [open, setOpen] = useState(false);
  /** 0 = ikke startet. 1..STEPS.length = karakterstegene. LAST_STEP er også fritekststeget. */
  const [step, setStep] = useState(1);
  const [ratings, setRatings] = useState<Record<RatedArea, number | null>>({
    testen: null,
    resultatet: null,
    spir: null,
  });
  /** Områder testeren aktivt har krysset av som "brukte den ikke". */
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setAlreadyGiven(window.localStorage.getItem(FEEDBACK_GIVEN_STORAGE_KEY) === APP_VERSION);
    } catch {
      // Privat nettlesing -- vi spør da bare på vanlig måte hver gang.
    }
  }, []);

  const current: Step = STEPS[step - 1] ?? STEPS[0];
  const isLastStep = step === LAST_STEP;
  /** "Neste" er sperret til området er besvart, med mindre det kan hoppes over. */
  const canAdvance =
    ratings[current.area] !== null || (current.skipLabel !== undefined && skipped[current.area]);

  function chooseRating(value: number) {
    setRatings((prev) => ({ ...prev, [current.area]: prev[current.area] === value ? null : value }));
    setSkipped((prev) => ({ ...prev, [current.area]: false }));
    setError(null);
  }

  function chooseSkip() {
    setSkipped((prev) => ({ ...prev, [current.area]: !prev[current.area] }));
    setRatings((prev) => ({ ...prev, [current.area]: null }));
    setError(null);
  }

  function resetForm() {
    setStep(1);
    setRatings({ testen: null, resultatet: null, spir: null });
    setSkipped({});
    setMessage("");
    setError(null);
  }

  async function handlePrimary() {
    if (!isLastStep) {
      if (!canAdvance) {
        setError("Velg en karakter for å gå videre.");
        return;
      }
      setError(null);
      setStep((s) => s + 1);
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ratings,
          message,
          device: deviceCategory(),
          durationSeconds: loadTestDurationSeconds(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Klarte ikke sende. Prøv gjerne igjen.");
        return;
      }
      setSent(true);
      setOpen(false);
      setAlreadyGiven(true);
      resetForm();
      try {
        window.localStorage.setItem(FEEDBACK_GIVEN_STORAGE_KEY, APP_VERSION);
      } catch {
        // se over
      }
    } catch {
      setError("Klarte ikke sende. Prøv gjerne igjen.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      // Bevisst det eneste elementet på resultatsiden med gullramme og varm
      // bakgrunn. Resten av siden er kjølig (himmelblått, lavendel, fiolett),
      // så kontrasten er i FARGETEMPERATUR, ikke bare i styrke -- det er det
      // som gjør at boksen leses som "dette er noe annet enn rapporten din"
      // i stedet for bare "enda et kort".
      // Rammefargen er gold-DARK i lys modus: #E0A93A mot sidebakgrunnen gir
      // bare 1,94:1, altså en ramme man knapt ser. Den mørkere gir 2,96:1
      // (WCAG 1.4.11 krever 3:1 for grafiske elementer). I mørk modus er det
      // motsatt -- der skiller den lyse gullfargen seg ut (5,6:1 mot indigo).
      className="flex flex-col gap-3 rounded-2xl border-2 border-gold-dark bg-gold-light/20 p-6 shadow-md dark:border-gold dark:bg-gold-dark/15 print:hidden"
    >
      <Badge tone="gold" className="self-start">
        Betaversjon {APP_VERSION}
      </Badge>

      <h2 className="font-display text-lg font-semibold text-indigo dark:text-white">
        {sent
          ? "Takk! Det hjelper."
          : alreadyGiven
            ? "Takk for tilbakemeldingen!"
            : "Kan du hjelpe meg med én ting?"}
      </h2>

      {!open && (
        <p className="text-sm text-indigo/80 dark:text-lavender-400/80">
          {sent || alreadyGiven
            ? "Kom du på noe mer i etterkant, er det bare å svare en gang til."
            : "Du er blant de første som tester Dine Fasetter. Tre raske spørsmål, og et felt du kan skrive i hvis du vil. Ærlige svar hjelper meg mye mer enn snille."}
        </p>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => {
            resetForm();
            setOpen(true);
            setSent(false);
          }}
          className={`self-start ${buttonClassNames(alreadyGiven ? "secondary" : "beta", "md")}`}
        >
          {alreadyGiven ? "Legg til mer" : "Gi meg tilbakemelding"}
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          <p
            aria-live="polite"
            className="text-xs font-medium uppercase tracking-wide text-indigo/60 dark:text-lavender-400/70"
          >
            Steg {step} av {LAST_STEP}
          </p>

          <fieldset className="flex flex-col gap-2">
            <legend className="font-display text-base font-semibold text-indigo dark:text-white">
              {current.question}
            </legend>
            <p className="text-xs text-indigo/70 dark:text-lavender-400/75">{current.hint}</p>

            <div className="mt-1 flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => {
                const selected = ratings[current.area] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${value} av 5`}
                    onClick={() => chooseRating(value)}
                    className={
                      selected
                        ? "h-11 w-11 rounded-lg bg-gold-dark text-base font-semibold text-white"
                        : "h-11 w-11 rounded-lg border border-gold-dark/40 text-base text-indigo dark:border-gold/30 dark:text-white"
                    }
                  >
                    {value}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between text-xs text-indigo/60 dark:text-lavender-400/70">
              <span>1 = {current.low}</span>
              <span>5 = {current.high}</span>
            </div>

            {current.skipLabel && (
              <button
                type="button"
                aria-pressed={!!skipped[current.area]}
                onClick={chooseSkip}
                className={
                  skipped[current.area]
                    ? "mt-1 self-start rounded-lg bg-gold-dark px-3 py-1.5 text-sm font-medium text-white"
                    : "mt-1 self-start rounded-lg border border-gold-dark/40 px-3 py-1.5 text-sm text-indigo dark:border-gold/30 dark:text-white"
                }
              >
                {current.skipLabel}
              </button>
            )}
          </fieldset>

          {isLastStep && (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-indigo dark:text-white">
                Noe annet du vil si? (valgfritt)
              </span>
              <span className="text-xs text-indigo/70 dark:text-lavender-400/75">
                F.eks. noe teknisk, hvordan det ser ut, ord du reagerte på.
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={4000}
                className="mt-1 rounded-lg border border-gold-dark/40 bg-white/70 px-3 py-2 text-sm text-indigo placeholder:text-indigo/40 dark:border-gold/30 dark:bg-indigo/40 dark:text-white dark:placeholder:text-lavender-400/40"
              />
            </label>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handlePrimary()}
              disabled={sending || (!isLastStep && !canAdvance)}
              className={`${buttonClassNames("beta", "md")} disabled:opacity-40`}
            >
              {sending ? "Sender …" : isLastStep ? "Send inn" : "Neste"}
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep((s) => s - 1);
                }}
                className="text-sm text-indigo/70 underline underline-offset-2 dark:text-lavender-400/75"
              >
                Tilbake
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              className="text-sm text-indigo/70 underline underline-offset-2 dark:text-lavender-400/75"
            >
              Avbryt
            </button>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-factor-stability">
              {error}
            </p>
          )}
        </div>
      )}

      {/* /70 og /75 -- ikke /60 som ellers i koden. På denne varmere, mørkere
          bakgrunnen faller lavender-400/60 til 3,64:1 i mørk modus, altså
          under AA-kravet på 4,5:1 for vanlig tekst. /75 gir 4,82:1. */}
      <p className="text-xs text-indigo/70 dark:text-lavender-400/75">
        Svaret er anonymt. Vi lagrer hvilken versjon og enhet du brukte, og hvor lang tid testen tok
        -- ikke hvem du er. Resultatet ditt blir liggende her.
      </p>
    </section>
  );
}
