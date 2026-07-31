"use client";

import { useEffect, useState } from "react";
import { APP_VERSION } from "@/lib/version";
import { loadTestDurationSeconds } from "@/lib/storage";
import { buttonClassNames } from "@/components/ui/Button";

/**
 * Tilbakemeldingsboks for betaperioden (v2.37, 31.07.2026).
 *
 * Plassert nederst på resultatsiden -- bevisst ETTER at brukeren har lest
 * profilen sin, ikke i bunnmenyen: engasjementet er på topp i det øyeblikket
 * de er ferdige med å lese, og faller bratt så snart de begynner å navigere
 * videre.
 *
 * Sender med et skjult teknisk felt i Google Forms-lenken på formatet
 * `enhet|versjon|tidsbruk` (f.eks. `mobil|2.37|412`), slik at en
 * tilbakemelding kan knyttes til NØYAKTIG den versjonen testeren så. Uten
 * dette er en klage umulig å tolke etter noen deployer -- gjaldt den en bug
 * som allerede er rettet, eller står den fortsatt?
 *
 * Personvern: ingen av verdiene identifiserer brukeren, og ingenting sendes
 * med mindre brukeren selv klikker på lenken. Skjemaet er anonymt.
 *
 * HELE KOMPONENTEN ER MIDLERTIDIG. Når betaperioden avsluttes fjernes den
 * fra src/app/resultat/page.tsx, sammen med `markTestStarted`-kallene i
 * src/app/test/page.tsx og tidsbrukshjelperne i src/lib/storage.ts.
 */

const FORM_BASE_URL =
  "https://docs.google.com/forms/d/e/" +
  "1FAIpQLSfvVcHeooQ0Z3r2LPGAkL-IjO0h9qxOHe6KDRtNWKRj2X74Fw" +
  "/viewform?usp=pp_url";

/** Feltet "Teknisk info" i skjemaet. Endres bare hvis spørsmålet slettes og lages på nytt. */
const TEKNISK_INFO_ENTRY_ID = "entry.1183486736";

/** Husker at det er gitt tilbakemelding PÅ DENNE VERSJONEN -- ny versjon spør på nytt. */
const FEEDBACK_GIVEN_STORAGE_KEY = "femfaktorer.tilbakemelding-gitt.v1";

function deviceLabel(): string {
  if (typeof window === "undefined") return "ukjent";
  const width = window.innerWidth;
  if (width <= 480) return "mobil";
  if (width <= 1024) return "nettbrett";
  return "desktop";
}

export function FeedbackPrompt() {
  // Lenken bygges først etter hydrering: både skjermbredde og tidsbruk
  // finnes bare i nettleseren, og en server-rendret href ville uansett vært
  // feil. Derfor null-sjekk under i stedet for å rendre en halv lenke.
  const [href, setHref] = useState<string | null>(null);
  const [alreadyGiven, setAlreadyGiven] = useState(false);

  useEffect(() => {
    const seconds = loadTestDurationSeconds();
    const teknisk = [deviceLabel(), APP_VERSION, seconds === null ? "ukjent" : String(seconds)].join("|");
    setHref(`${FORM_BASE_URL}&${TEKNISK_INFO_ENTRY_ID}=${encodeURIComponent(teknisk)}`);

    try {
      setAlreadyGiven(window.localStorage.getItem(FEEDBACK_GIVEN_STORAGE_KEY) === APP_VERSION);
    } catch {
      // Privat nettlesing -- vi spør da bare på vanlig måte hver gang.
    }
  }, []);

  function rememberClick() {
    try {
      window.localStorage.setItem(FEEDBACK_GIVEN_STORAGE_KEY, APP_VERSION);
    } catch {
      // se over
    }
    setAlreadyGiven(true);
  }

  if (!href) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
      <h2 className="font-display font-semibold text-indigo dark:text-white">
        {alreadyGiven ? "Takk for tilbakemeldingen" : "Du tester en betaversjon"}
      </h2>
      <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
        {alreadyGiven
          ? "Kom du på noe mer i etterkant, er det bare å svare en gang til."
          : "Var det noe som var uklart, rart eller kjedelig underveis? Ærlige svar hjelper meg mye mer enn snille. Det tar omtrent ett minutt, og svaret er anonymt."}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={rememberClick}
        className={`self-start ${buttonClassNames(alreadyGiven ? "secondary" : "primary", "md")}`}
      >
        {alreadyGiven ? "Legg til mer" : "Hjelp meg å gjøre testen bedre"}
      </a>
    </section>
  );
}
