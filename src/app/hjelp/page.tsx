/**
 * Innhold basert på Dokument 04: GLOBAL-002, KORTTEST-006, RESULTAT-006/007,
 * AI-005, AI-006.
 */
export default function HjelpPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-ink dark:text-white sm:text-3xl">Hjelp</h1>
        <p className="text-ink/80 dark:text-warmgray/80">
          FemFaktorer er et verktøy for selvinnsikt og refleksjon. Det er ikke en diagnose eller en
          erstatning for profesjonell vurdering.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-ink dark:text-white">Hvor lagres svarene mine?</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Svarene dine lagres bare i denne nettleseren (lokalt på enheten din), ikke hos
          FemFaktorer. Du trenger ingen konto for å ta testen. Du kan slette dataene dine når som
          helst fra resultatsiden.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-ink dark:text-white">Hva skjer når jeg snakker med Spir?</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Når du aktivt starter en samtale med Spir, sendes resultatet ditt til Anthropic (Spirs
          leverandør) som kontekst for svarene. Ikke del opplysninger du ikke ønsker at tjenesten
          skal behandle. Svar fra Spir kan være feil eller for generelle -- vurder dem kritisk og
          bruk dem som støtte til refleksjon, ikke som profesjonell rådgivning.
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-lg bg-mint/50 p-5 dark:bg-white/5">
        <h2 className="font-semibold text-ink dark:text-white">Ved akutt behov for hjelp</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Spir er ikke en akuttjeneste. Ved fare for liv eller helse må du kontakte relevante
          nødtjenester eller helsepersonell.
        </p>
      </section>
    </main>
  );
}
