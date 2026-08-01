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
 * v2.46 (31.07.2026): SKJEMAET ER FLYTTET FRA GOOGLE FORMS TIL NETTSTEDET
 * SELV. Tre grunner (se også src/lib/feedback/blobs.ts):
 *  - Versjon, enhet og tidsbruk følger nå automatisk med i stedet for å
 *    limes inn i et skjult felt som kan miste synkroniseringen.
 *  - Tilbakemeldingene vises i adminpanelet, ved siden av tallene de
 *    handler om.
 *  - Testeren blir værende på siden. Den gamle løsningen åpnet en ny fane,
 *    og hvert slikt hopp koster svar.
 *
 * Fortsatt anonymt: ingen e-post, intet navn, ingen IP. Det betyr også at du
 * ikke kan svare den som melder fra -- se blobs.ts for hva som skal til for
 * å endre det.
 *
 * HELE KOMPONENTEN ER MIDLERTIDIG. Når betaperioden avsluttes fjernes den
 * fra src/app/resultat/page.tsx, sammen med `markTestStarted`-kallene i
 * src/app/test/page.tsx og tidsbrukshjelperne i src/lib/storage.ts.
 */

/** Husker at det er gitt tilbakemelding PÅ DENNE VERSJONEN -- ny versjon spør på nytt. */
const FEEDBACK_GIVEN_STORAGE_KEY = "femfaktorer.tilbakemelding-gitt.v1";

const AREAS = [
  { value: "testen", label: "Selve testen" },
  { value: "resultatet", label: "Resultatet" },
  { value: "spir", label: "Spir" },
  { value: "spraket", label: "Språket" },
  { value: "teknisk", label: "Noe teknisk" },
  { value: "annet", label: "Annet" },
] as const;

export function FeedbackPrompt() {
  const [alreadyGiven, setAlreadyGiven] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [area, setArea] = useState<string>("testen");
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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          rating,
          area,
          device: deviceCategory(),
          durationSeconds: loadTestDurationSeconds(),
        }),
      });
      if (!res.ok) {
        setError("Klarte ikke sende. Prøv gjerne igjen.");
        return;
      }
      setSent(true);
      setAlreadyGiven(true);
      setMessage("");
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
      // i stedet for bare "enda et kort". Rammen er 2px mot resten av sidens
      // 1px, og gull er ellers reservert for merker/highlights (se
      // tailwind.config.ts), så den stjeler ikke oppmerksomhet fra noe annet.
      // Rammefargen er gold-DARK i lys modus, ikke gold: #E0A93A mot
      // sidebakgrunnen gir bare 1,94:1, altså en ramme man knapt ser. Den
      // mørkere varianten gir 2,96:1 (WCAG 1.4.11 krever 3:1 for grafiske
      // elementer). I mørk modus er det motsatt -- der er den lyse gullfargen
      // den som skiller seg ut (5,6:1 mot indigo).
      className="flex flex-col gap-3 rounded-2xl border-2 border-gold-dark bg-gold-light/20 p-6 shadow-md dark:border-gold dark:bg-gold-dark/15 print:hidden"
    >
      <Badge tone="gold" className="self-start">
        Betaversjon {APP_VERSION}
      </Badge>

      <h2 className="font-display text-lg font-semibold text-indigo dark:text-white">
        {sent ? "Takk! Det hjelper." : alreadyGiven ? "Takk for tilbakemeldingen!" : "Kan du hjelpe meg med én ting?"}
      </h2>

      <p className="text-sm text-indigo/80 dark:text-lavender-400/80">
        {sent
          ? "Kom du på noe mer i etterkant, er det bare å skrive en gang til."
          : alreadyGiven
            ? "Kom du på noe mer i etterkant, er det bare å skrive en gang til."
            : "Du er blant de første som tester Dine Fasetter. Var det noe som var uklart, rart eller kjedelig underveis? Ærlige svar hjelper meg mye mer enn snille."}
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSent(false);
          }}
          className={`self-start ${buttonClassNames(alreadyGiven ? "secondary" : "beta", "md")}`}
        >
          {alreadyGiven ? "Legg til mer" : "Gi meg tilbakemelding"}
        </button>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-indigo/80 dark:text-lavender-400/80">
              Hva gjelder det?
            </span>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="rounded-lg border border-gold-dark/40 bg-white/70 px-3 py-2 text-sm text-indigo dark:border-gold/30 dark:bg-indigo/40 dark:text-white"
            >
              {AREAS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="flex flex-col gap-1">
            <legend className="text-xs font-medium text-indigo/80 dark:text-lavender-400/80">
              Hvordan var opplevelsen samlet sett? (valgfritt)
            </legend>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={rating === value}
                  onClick={() => setRating(rating === value ? null : value)}
                  className={
                    rating === value
                      ? "h-9 w-9 rounded-lg bg-gold-dark text-sm font-semibold text-white"
                      : "h-9 w-9 rounded-lg border border-gold-dark/40 text-sm text-indigo dark:border-gold/30 dark:text-white"
                  }
                >
                  {value}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-indigo/80 dark:text-lavender-400/80">
              Hva vil du si?
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={4000}
              placeholder="Skriv så konkret du klarer -- hvilken side, hvilket spørsmål, hva du forventet."
              className="rounded-lg border border-gold-dark/40 bg-white/70 px-3 py-2 text-sm text-indigo placeholder:text-indigo/40 dark:border-gold/30 dark:bg-indigo/40 dark:text-white dark:placeholder:text-lavender-400/40"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className={`${buttonClassNames("beta", "md")} disabled:opacity-40`}
            >
              {sending ? "Sender …" : "Send inn"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-indigo/70 underline underline-offset-2 dark:text-lavender-400/75"
            >
              Avbryt
            </button>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
        </form>
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
