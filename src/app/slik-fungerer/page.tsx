import Link from "next/link";

/**
 * Konsolidert "om"-side (v2.5). Slår sammen innholdet som tidligere lå
 * spredt på tre sider -- /slik-fungerer, /om-femfaktormodellen og
 * /metode-og-kilder -- til én oversiktlig side med tydelige overskrifter,
 * etter produkteiers ønske om færre, mer brukervennlige sider. De to andre
 * rutene omdirigerer hit (se redirect-filene i samme mapper) for å ikke
 * brekke eksisterende lenker. Innhold fortsatt basert på Dokument 04
 * (INTRO-001 til INTRO-005), Dokument 04 §3.1, og Dokument 06 §3, §5, §6,
 * §9, §10 -- se de opprinnelige filene i git-historikken for kildehenvisning
 * per seksjon.
 *
 * Lenker videre til /personvern for den fullstendige personvernoversikten,
 * i stedet for å gjenta det innholdet her.
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

const SECTIONS = [
  { id: "slik-fungerer", label: "Slik fungerer testen" },
  { id: "femfaktormodellen", label: "Om femfaktormodellen" },
  { id: "metode-og-kilder", label: "Metode og kilder" },
  { id: "personvern", label: "Personvern" },
];

export default function OmFemfaktorerPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-indigo dark:text-white sm:text-3xl">
          Om Dine Fasetter
        </h1>
        <p className="text-indigo/80 dark:text-lavender-400/80">
          Alt du trenger å vite for å forstå hva testen gjør, hva den bygger på, og hvordan vi
          behandler opplysningene dine -- samlet på én side.
        </p>
      </header>

      <nav aria-label="Innhold på siden" className="rounded-lg bg-lavender-100/50 p-5 dark:bg-white/5">
        <h2 className="mb-3 font-semibold text-indigo dark:text-white">Innhold</h2>
        <ul className="flex flex-col gap-1.5 text-sm">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-holo-skyText underline underline-offset-2">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="slik-fungerer" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-indigo dark:text-white">Slik fungerer testen</h2>
        <p className="text-indigo/80 dark:text-lavender-400/80">
          Femfaktormodellen beskriver personlighet gjennom fem brede trekk. Hvert trekk er en
          skala, ikke en kategori. Du kan ligge nærmere den ene eller den andre enden, eller et
          sted mellom.
        </p>
        <ol className="flex flex-col gap-3 text-indigo/80 dark:text-lavender-400/80">
          <li>1. Svar på utsagn om hvordan du vanligvis tenker, føler og handler.</li>
          <li>2. Se resultatet ditt for de fem hovedfaktorene, med en kort forklaring for hver.</li>
          <li>
            3. Bruk refleksjonsspørsmålene i resultatet -- og snakk gjerne videre med Spir -- til å
            utforske hva profilen kan bety i ulike situasjoner.
          </li>
        </ol>
        <div className="flex flex-col gap-3 rounded-lg bg-lavender-100/50 p-5 dark:bg-white/5">
          <h3 className="font-semibold text-indigo dark:text-white">Hva resultatet bygger på</h3>
          <p className="text-indigo/80 dark:text-lavender-400/80">
            Resultatet bygger på svarene dine her og nå. Det er ikke en fullstendig beskrivelse av
            deg, og det kan påvirkes av situasjon, erfaring, språkforståelse og hvordan du tolker
            spørsmålene.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-indigo dark:text-white">Hva testen kan brukes til</h3>
          <p className="text-indigo/80 dark:text-lavender-400/80">
            Testen kan brukes til selvrefleksjon, samtaler og personlig utvikling. Den bør ikke
            brukes alene til å avgjøre ansettelser, diagnoser, behandling, partnervalg eller andre
            beslutninger med store konsekvenser.
          </p>
        </div>
      </section>

      <section id="femfaktormodellen" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-indigo dark:text-white">Om femfaktormodellen</h2>
        <p className="text-indigo/80 dark:text-lavender-400/80">
          Femfaktormodellen (Big Five) er den mest forskningsstøttede modellen for normal
          personlighet. Den beskriver individuelle forskjeller langs fem brede dimensjoner. Ingen
          skår er riktig eller feil.
        </p>
        <div className="flex flex-col gap-4">
          {FACTORS.map((f) => (
            <article key={f.name} className="rounded-lg bg-lavender-100/50 p-5 dark:bg-white/5">
              <h3 className="font-semibold text-indigo dark:text-white">{f.name}</h3>
              <p className="text-indigo/80 dark:text-lavender-400/80">{f.text}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-indigo dark:text-white">Ikke en type</h3>
          <p className="text-indigo/80 dark:text-lavender-400/80">
            Du blir ikke plassert i en personlighetstype. Resultatet viser grader av trekk langs
            kontinuerlige skalaer. De fleste mennesker har en sammensatt profil som kan komme ulikt
            til uttrykk i ulike situasjoner.
          </p>
        </div>
      </section>

      <section id="metode-og-kilder" className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-indigo dark:text-white">Metode og kilder</h2>
        <p className="text-indigo/80 dark:text-lavender-400/80">
          Dine Fasetter bygger på IPIP-NEO-120 -- et offentlig tilgjengelig spørsmålssett utviklet
          for å måle femfaktormodellen. Det er valgt fordi det er forskningsbasert, offentlig
          tilgjengelig og kan brukes uten kommersiell lisens.
        </p>
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-indigo dark:text-white">Hvordan resultatet beregnes</h3>
          <p className="text-indigo/80 dark:text-lavender-400/80">
            I denne tidlige versjonen regnes svarene dine om til en skala fra 0 til 100 ved en
            enkel, lineær omregning -- ikke ved sammenligning med en dokumentert normgruppe. Vi
            viser derfor resultatet som et nivåbånd (f.eks. "Svært tydelig høy"), ikke som et
            eksakt tall -- et eksakt tall ville gitt et falskt inntrykk av presisjon vi ikke har
            grunnlag for ennå. Fullfører du hele testen, bidrar de ferdig beregnede skårene dine
            -- helt anonymt -- til å bygge et ekte normgrunnlag over tid (se personvernsiden), som
            etter hvert kan gjøre resultatet mer presist.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-indigo dark:text-white">Hva resultatet ikke er</h3>
          <p className="text-indigo/80 dark:text-lavender-400/80">
            Resultatene beskriver sannsynlige personlighetstrekk og preferanser -- ikke
            intelligens, psykisk helse, diagnoser eller menneskelig verdi. Dine Fasetter er ikke et
            medisinsk eller diagnostisk verktøy.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-indigo dark:text-white">Kilder og referanser</h3>
          <p className="text-indigo/80 dark:text-lavender-400/80">
            Hovedreferanser for femfaktormodellen omfatter Costa &amp; McCrae, Goldberg, John,
            Robins &amp; Pervin, Soto og DeYoung. Spørsmålssettet er hentet fra IPIP (International
            Personality Item Pool, ipip.ori.org), som gjør spørsmål og skalaer offentlig
            tilgjengelig.
          </p>
        </div>
      </section>

      <section id="personvern" className="flex flex-col gap-3 rounded-lg border border-holo-sky/30 p-5">
        <h2 className="text-xl font-semibold text-indigo dark:text-white">Personvern</h2>
        <p className="text-indigo/80 dark:text-lavender-400/80">
          Svarene dine lagres bare i nettleseren din, ikke hos Dine Fasetter, med mindre du selv
          aktivt velger å snakke med Spir eller lagre resultatet på en konto. For den fullstendige
          oversikten -- inkludert cookies, hvilke tjenester som er involvert, og dine rettigheter --
          se personvernsiden.
        </p>
        <Link
          href="/personvern"
          className="self-start rounded-lg bg-holo-sky px-5 py-2.5 font-medium text-white"
        >
          Les hele personvernoversikten
        </Link>
      </section>

      <Link href="/test" className="self-start rounded-lg bg-holo-sky px-6 py-3 font-medium text-white">
        Start testen
      </Link>
    </main>
  );
}
