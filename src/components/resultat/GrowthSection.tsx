import type { Interpretation } from "@/data/interpretations";

/**
 * v2.38 (produkteiers ønske 26.07.2026, kvalitetssammenligning mot en
 * konkurrent-PDF): kort "hva gjør jeg med dette"-seksjon per hovedkategori --
 * Balansert/Ubalansert/Bygg videre + én konkret øvelse (se `growth`-feltet i
 * interpretations.ts). Vises i ALLE tre resultatnivåer og i PDF-eksporten
 * (lib/pdfReport.ts har en tilsvarende, men egen tegnet versjon siden jsPDF
 * ikke kan gjenbruke JSX).
 *
 * v2.45 (Kvalitetsrevisjon 31.07.2026, kap. 5, funn 1): flyttet ut av
 * resultat/page.tsx (som var 989 linjer og voksende) til sin egen fil, som
 * del av en større opprydding -- se FreeTierResult.tsx/DetailedResult.tsx
 * for de andre utflyttede stykkene. Ingen atferdsendring.
 */
export function GrowthSection({ growth }: { growth: Interpretation["growth"] }) {
  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-indigo/10 pt-3 dark:border-white/10">
      {/* v2.41 (produkteiers tilbakemelding 28.07.2026): "Balansert og
          ubalansert" beskrev bare halve seksjonen -- de to første setningene
          (balansert/ubalansert) ER i praksis en kortere, strukturert
          gjentakelse av styrke/utfordring-dynamikken som allerede står i
          synthesis-teksten over. DET som faktisk er nytt her er "Bygg
          videre" + ukesøvelsen -- fremadskuende, konkret handling som ikke
          finnes noe annet sted i rapporten. En overskrift som "Oppsummering"
          ville derfor undersolgt nettopp den nye delen (og friste folk til å
          hoppe over noe de tror de allerede har lest). Valgte i stedet en
          spørsmålsoverskrift, samme mønster som den avsluttende "Hva betyr
          dette for deg?" -- signaliserer tydelig at dette er handlingsrettet,
          ikke en oppsummering. */}
      <h3 className="text-sm font-medium text-indigo dark:text-white">Hva kan du gjøre med dette?</h3>
      <p className="text-indigo/80 dark:text-lavender-400/80">
        <span className="font-medium text-indigo dark:text-white">Balansert: </span>
        {growth.balanced}
      </p>
      <p className="text-indigo/80 dark:text-lavender-400/80">
        <span className="font-medium text-indigo dark:text-white">Ubalansert: </span>
        {growth.unbalanced}
      </p>
      <p className="text-indigo/80 dark:text-lavender-400/80">
        <span className="font-medium text-indigo dark:text-white">Bygg videre: </span>
        {growth.rebalancing}
      </p>
      <p className="mt-1 text-sm text-indigo/70 dark:text-lavender-400/70">
        <span className="font-medium text-indigo dark:text-white">Prøv denne uken: </span>
        {growth.exercise}
      </p>
    </div>
  );
}
