import Link from "next/link";

/**
 * Grafisk pris-/nivåoversikt (v2.35, produkteiers ønske 20.07.2026): en
 * offentlig side som viser de tre nivåene side ved side -- klassisk
 * "sammenligningstabell"-mønster (overskriftsrad per nivå, funksjonsrader
 * med avkrysning under). Innholdet er hentet fra den besluttede tabellen i
 * FemFaktorer_Forretnings-og-prismodell_v1.2.docx del 6, men KUN funksjoner
 * som faktisk er bygget og live er tatt med i selve sammenligningen --
 * planlagte, ikke-bygde funksjoner (partnerkobling, delbare sosiale
 * medie-kort) nevnes for seg under tabellen i stedet for å late som de
 * finnes i dag.
 *
 * VIKTIG, produkteiers eksplisitte krav (18.07.2026): ingen betalingssperre
 * finnes ennå -- ALLE nivåer kan velges helt gratis i dag ved å bare
 * fortsette til flere spørsmål i testen. Prisene under er de PLANLAGTE
 * prisene når betaling en gang innføres -- siden sier dette tydelig øverst
 * for å ikke skape et falskt inntrykk av at noe koster penger i dag.
 *
 * Widere enn det vanlige `max-w-2xl` for undersider (se f.eks. /hjelp) --
 * en 4-kolonners sammenligningstabell (funksjon + tre nivåer) trenger mer
 * bredde for å være lesbar uten unødvendig linjebryting.
 */

interface Tier {
  key: "free" | "full" | "extended";
  name: string;
  price: string;
  tagline: string;
  highlight?: boolean;
}

const TIERS: Tier[] = [
  { key: "free", name: "Gratis", price: "0 kr", tagline: "Prøv testen og se hva du finner." },
  {
    key: "full",
    name: "Standard",
    price: "19 kr",
    tagline: "Et tydelig mer utfyllende resultat.",
    highlight: true,
  },
  { key: "extended", name: "Premium", price: "99 kr", tagline: "Den mest komplette versjonen." },
];

type Cell = string | boolean;

interface FeatureRow {
  label: string;
  values: [Cell, Cell, Cell]; // rekkefølge: Gratis, Standard, Premium
  note?: string;
}

const FEATURES: FeatureRow[] = [
  { label: "Antall spørsmål", values: ["50", "120", "290"] },
  {
    label: "Analyse per hovedkategori",
    values: ["Kort oppsummering", "Fullstendig analyse", "Fullstendig analyse"],
  },
  {
    label: "Fasettnivå-analyse (29 underkategorier)",
    values: [false, false, true],
  },
  {
    label: "Råd om jobb og kjærlighet",
    values: [true, true, true],
    note: "På Standard og Premium inngår rådene i en mer utfyllende analysetekst enn på gratisnivået.",
  },
  { label: "Samtale med Spir (AI-veileder)", values: [false, true, true] },
  { label: "PDF-nedlasting", values: [false, true, true] },
  {
    label: "Lagring i skyen (logg inn fra andre enheter)",
    values: [false, "12 mnd", "12 mnd"],
  },
  {
    label: "Utvikling over tid (flere lagrede resultater)",
    values: [false, false, true],
  },
];

function Dot({ included }: { included: boolean }) {
  if (included) {
    return (
      <span
        className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-holo-sky text-indigo"
        aria-hidden="true"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6.2 L4.8 9 L10 3"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span
      className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-lavender-100 text-indigo/30 dark:bg-white/5 dark:text-lavender-400/30"
      aria-hidden="true"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M1,1 L9,9 M9,1 L1,9" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    </span>
  );
}

function FeatureCell({ value }: { value: Cell }) {
  if (typeof value === "boolean") {
    return (
      <td className="px-3 py-3 text-center">
        <Dot included={value} />
        <span className="sr-only">{value ? "Inkludert" : "Ikke inkludert"}</span>
      </td>
    );
  }
  return (
    <td className="px-3 py-3 text-center text-sm text-indigo/80 dark:text-lavender-400/80">{value}</td>
  );
}

export default function PriserPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-2xl font-bold text-indigo dark:text-white sm:text-3xl">
          Nivåer og priser
        </h1>
        <p className="text-indigo/80 dark:text-lavender-400/80">
          Dine Fasetter har tre nivåer -- de skiller seg i hvor mange spørsmål du svarer på, og hvor
          utfyllende resultatet blir.
        </p>
        <p className="rounded-xl border border-holo-sky/40 bg-holo-sky/10 p-4 text-sm text-indigo/80 dark:text-lavender-400/80">
          Dine Fasetter er foreløpig i betaversjon -- alle tre nivåene kan prøves helt gratis i dag,
          uansett hva som står under. Du velger nivå ved rett og slett å svare på flere spørsmål i
          samme test. Prisene under er de planlagte prisene for når betaling en gang innføres, slik
          at du kan danne deg et inntrykk allerede nå av hva de ulike nivåene vil koste.
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="w-56 px-3 pb-4 align-bottom" />
              {TIERS.map((tier) => (
                <th
                  key={tier.key}
                  className={`px-3 pb-4 align-bottom text-center ${
                    tier.highlight ? "relative" : ""
                  }`}
                >
                  <div
                    className={`flex flex-col items-center gap-1 rounded-2xl p-4 ${
                      tier.highlight
                        ? "border-2 border-holo-sky bg-holo-sky/10"
                        : "border border-lavender-400/30 dark:border-white/10"
                    }`}
                  >
                    {tier.highlight && (
                      <span className="mb-1 rounded-full bg-holo-sky px-3 py-0.5 text-xs font-semibold text-indigo">
                        Mest populær
                      </span>
                    )}
                    <span className="font-display text-lg font-bold text-indigo dark:text-white">
                      {tier.name}
                    </span>
                    <span className="font-display text-2xl font-bold text-indigo dark:text-white">
                      {tier.price}
                    </span>
                    {tier.price !== "0 kr" && (
                      <span className="text-xs text-indigo/50 dark:text-lavender-400/50">inkl. mva</span>
                    )}
                    <span className="mt-1 text-xs font-normal text-indigo/70 dark:text-lavender-400/70">
                      {tier.tagline}
                    </span>
                    <Link
                      href="/test"
                      className="mt-3 w-full rounded-xl bg-holo-sky px-4 py-2 text-sm font-semibold text-indigo shadow-sm hover:opacity-90"
                    >
                      Prøv nivået
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((row, i) => (
              <tr
                key={row.label}
                className={i % 2 === 0 ? "bg-lavender-100/40 dark:bg-white/[0.03]" : ""}
              >
                <td className="rounded-l-xl px-3 py-3 text-sm font-medium text-indigo dark:text-white">
                  {row.label}
                  {row.note && (
                    <p className="mt-0.5 text-xs font-normal text-indigo/50 dark:text-lavender-400/50">
                      {row.note}
                    </p>
                  )}
                </td>
                {row.values.map((value, j) => (
                  <FeatureCell key={j} value={value} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-lavender-400/30 bg-lavender-100/40 p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="font-display font-semibold text-indigo dark:text-white">
          På vei, uavhengig av nivå
        </h2>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          To ting er planlagt, men ikke bygget ennå -- de er derfor holdt utenfor sammenligningen
          over: delbare bilder/kort til sosiale medier, og en mulighet til å koble deg med en
          partner eller venn for en kompatibilitetsanalyse (enkel variant på gratisnivået, en mer
          fullverdig variant med Spir-samtale på Premium).
        </p>
      </section>

      <p className="text-center text-sm text-indigo/60 dark:text-lavender-400/60">
        Usikker på hvor du bør begynne?{" "}
        <Link href="/test" className="text-holo-skyText underline underline-offset-2">
          Start med de 50 gratis spørsmålene
        </Link>{" "}
        -- du kan alltid fortsette videre etterpå.
      </p>
    </main>
  );
}
