import Link from "next/link";

/**
 * Innhold basert på Dokument 04 (Innholdsbibliotek v1.0), INTRO-001 til
 * INTRO-005. Steget om "fulltest med 30 underområder" er utelatt/tilpasset
 * inntil den funksjonen faktisk er bygget (se Grunnlagsdokumentet §7.1 og
 * oppgave om 50/120-utvidelse) -- denne siden skal alltid beskrive hva
 * løsningen faktisk gjør i dag, ikke planlagte steg.
 */
export default function SlikFungererPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-ink dark:text-white sm:text-3xl">
          Slik fungerer FemFaktorer
        </h1>
        <p className="text-ink/80 dark:text-warmgray/80">
          Femfaktormodellen beskriver personlighet gjennom fem brede trekk. Hvert trekk er en
          skala, ikke en kategori. Du kan ligge nærmere den ene eller den andre enden, eller et
          sted mellom.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-ink dark:text-white">Stegene i testen</h2>
        <ol className="flex flex-col gap-3 text-ink/80 dark:text-warmgray/80">
          <li>1. Svar på utsagn om hvordan du vanligvis tenker, føler og handler.</li>
          <li>2. Se resultatet ditt for de fem hovedfaktorene, med en kort forklaring for hver.</li>
          <li>
            3. Bruk refleksjonsspørsmålene i resultatet -- og snakk gjerne videre med Spir -- til å
            utforske hva profilen kan bety i ulike situasjoner.
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3 rounded-lg bg-mint/50 p-5 dark:bg-white/5">
        <h2 className="font-semibold text-ink dark:text-white">Hva resultatet bygger på</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Resultatet bygger på svarene dine her og nå. Det er ikke en fullstendig beskrivelse av
          deg, og det kan påvirkes av situasjon, erfaring, språkforståelse og hvordan du tolker
          spørsmålene.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-ink dark:text-white">Hva testen kan brukes til</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Testen kan brukes til selvrefleksjon, samtaler og personlig utvikling. Den bør ikke
          brukes alene til å avgjøre ansettelser, diagnoser, behandling, partnervalg eller andre
          beslutninger med store konsekvenser.
        </p>
      </section>

      <Link href="/test" className="self-start rounded-lg bg-teal px-6 py-3 font-medium text-white">
        Start testen
      </Link>
    </main>
  );
}
