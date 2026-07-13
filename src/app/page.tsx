import Link from "next/link";
import { QUESTIONS } from "@/data/questions";

export default function ForsidePage() {
  const minutes = Math.ceil(QUESTIONS.length * 0.15); // grovt anslag, ~9 sek/spørsmål

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-ink dark:text-white sm:text-4xl">FemFaktorer</h1>
      <p className="max-w-md text-ink/80 dark:text-warmgray/80">
        Bli litt klokere på hvem du egentlig er. En norsk personlighetstest basert på
        offentlig tilgjengelig forskning på femfaktormodellen (Big Five).
      </p>
      <p className="text-sm text-ink/60 dark:text-warmgray/60">
        {QUESTIONS.length} spørsmål &middot; ca. {minutes} minutter &middot; helt anonymt
      </p>
      <Link
        href="/test"
        className="rounded-lg bg-teal px-8 py-3 text-lg font-medium text-white shadow-sm hover:opacity-90"
      >
        Start testen
      </Link>
      <p className="max-w-md text-xs text-ink/50 dark:text-warmgray/50">
        Svarene dine lagres bare i denne nettleseren. Ingen konto er nødvendig.
      </p>
    </main>
  );
}
