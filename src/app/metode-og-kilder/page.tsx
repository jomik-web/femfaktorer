/**
 * Innhold basert på Dokument 06 (Forskningsgrunnlag og faglig dokumentasjon
 * v1.0) §3, §5, §6, §9, §10, og Grunnlagsdokumentet §7 (beslutning om
 * lineær skalering for MVP, v1.7).
 */
export default function MetodeOgKilderPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-ink dark:text-white sm:text-3xl">
          Metode og kilder
        </h1>
        <p className="text-ink/80 dark:text-warmgray/80">
          FemFaktorer bygger på IPIP-NEO-120 -- et offentlig tilgjengelig spørsmålssett utviklet
          for å måle femfaktormodellen. Det er valgt fordi det er forskningsbasert, offentlig
          tilgjengelig og kan brukes uten kommersiell lisens.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-ink dark:text-white">Hvordan resultatet beregnes</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          I denne tidlige versjonen regnes svarene dine om til en skala fra 0 til 100 ved en enkel,
          lineær omregning -- ikke ved sammenligning med en dokumentert normgruppe. Det betyr at
          resultatet viser hvor du ligger på skalaen, men ikke nøyaktig hvor stor andel av
          befolkningen som skårer likt eller ulikt. Vi planlegger å innføre et dokumentert
          normgrunnlag i en senere versjon.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-ink dark:text-white">Hva resultatet ikke er</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Resultatene beskriver sannsynlige personlighetstrekk og preferanser -- ikke intelligens,
          psykisk helse, diagnoser eller menneskelig verdi. FemFaktorer er ikke et medisinsk eller
          diagnostisk verktøy.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-ink dark:text-white">Kilder og referanser</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Hovedreferanser for femfaktormodellen omfatter Costa &amp; McCrae, Goldberg, John, Robins
          &amp; Pervin, Soto og DeYoung. Spørsmålssettet er hentet fra IPIP (International
          Personality Item Pool, ipip.ori.org), som gjør spørsmål og skalaer offentlig tilgjengelig.
        </p>
      </section>
    </main>
  );
}
