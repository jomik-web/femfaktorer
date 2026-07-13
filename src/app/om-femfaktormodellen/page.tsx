/**
 * Innhold basert på Dokument 04 §3.1 (Faste faktorbetegnelser) og
 * Dokument 06 §2 (Faglig fundament), samt FORSIDE-008.
 */
const FACTORS = [
  {
    name: "Åpenhet for erfaring",
    text: "nysgjerrighet, fantasi, ideer, estetikk og interesse for nye perspektiver",
  },
  {
    name: "Planmessighet",
    text: "organisering, ansvarlighet, selvdisiplin og målrettethet",
  },
  {
    name: "Ekstroversjon",
    text: "sosial energi, aktivitet, tydelighet og behov for ytre stimulering",
  },
  {
    name: "Medmenneskelighet",
    text: "tillit, omtanke, samarbeid og balansen mellom egne og andres behov",
  },
  {
    name: "Emosjonell stabilitet",
    text: "måter å reagere på stress, usikkerhet, motgang og følelsesmessig belastning",
  },
];

export default function OmFemfaktormodellenPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-ink dark:text-white sm:text-3xl">
          Om femfaktormodellen
        </h1>
        <p className="text-ink/80 dark:text-warmgray/80">
          Femfaktormodellen (Big Five) er den mest forskningsstøttede modellen for normal
          personlighet. Den beskriver individuelle forskjeller langs fem brede dimensjoner. Ingen
          skår er riktig eller feil.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        {FACTORS.map((f) => (
          <article key={f.name} className="rounded-lg bg-mint/50 p-5 dark:bg-white/5">
            <h2 className="font-semibold text-ink dark:text-white">{f.name}</h2>
            <p className="text-ink/80 dark:text-warmgray/80">{f.text}</p>
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-ink dark:text-white">Ikke en type</h2>
        <p className="text-ink/80 dark:text-warmgray/80">
          Du blir ikke plassert i en personlighetstype. Resultatet viser grader av trekk langs
          kontinuerlige skalaer. De fleste mennesker har en sammensatt profil som kan komme ulikt
          til uttrykk i ulike situasjoner.
        </p>
      </section>
    </main>
  );
}
