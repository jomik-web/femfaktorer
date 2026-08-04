"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClassNames } from "@/components/ui/Button";

/**
 * Felles ramme for alle adminsider (v2.46, 31.07.2026).
 *
 * Samler tilgangssjekken ett sted i stedet for at hver side gjentar den.
 * Tilgang gis fortsatt av den vanlige e-post/kode-innloggingen pluss
 * rollesjekk (se lib/admin/auth.ts) -- ingen egen adminpålogging, som var
 * hele poenget med omleggingen bort fra passkeys i v2.28.
 *
 * MERK AT DETTE ER EN KLIENTSIDIG SJEKK, OG HVA DEN ER VERDT: den avgjør
 * hva som TEGNES, ikke hva som er tillatt. Den ekte sperren ligger i hvert
 * enkelt API-endepunkt (`requireAdminEmail`). Skulle noen omgå denne
 * komponenten, får de en tom side uten data -- alle kallene ville feilet med
 * 401. Ingen adminside skal noensinne inneholde data som ikke kommer fra et
 * slikt gatet endepunkt.
 */

const TABS = [
  { href: "/admin", label: "Oversikt" },
  { href: "/admin/tilbakemeldinger", label: "Tilbakemeldinger" },
  { href: "/admin/innstillinger", label: "Innstillinger" },
  { href: "/admin/roller", label: "Tilganger" },
  { href: "/admin/drift", label: "Drift" },
] as const;

type Screen = "loading" | "logged-out" | "not-admin" | "ok";

/**
 * Vei ut av adminområdet (v2.50, produkteiers rapport 04.08.2026).
 *
 * BAKGRUNN: toppmenyen og bunnteksten er bevisst skjult på /admin (se
 * SiteNav og SiteFooter, som returnerer null der) -- adminpanelet skal være
 * et eget, avgrenset område uten den vanlige brukerreisen rundt seg.
 *
 * Bieffekten var en blindvei: logget man ut fra panelet, satt man igjen med
 * en nesten tom side der eneste utvei var å logge inn igjen. Ingen meny,
 * ingen bunntekst, ingen vei tilbake til nettstedet. Eneste utvei var
 * nettleserens tilbakeknapp eller å skrive inn adressen manuelt.
 *
 * Vises KUN på de to skjermene der man ikke er inne i panelet. Inne i selve
 * panelet er fravær av sidenavigasjon fortsatt riktig -- da er man i gang
 * med noe, og lenker ut ville bare vært støy.
 */
function ExitLinks() {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
      <Link
        href="/test"
        className="text-indigo/70 underline underline-offset-2 dark:text-lavender-400/70"
      >
        Til testen
      </Link>
      <Link
        href="/resultat"
        className="text-indigo/70 underline underline-offset-2 dark:text-lavender-400/70"
      >
        Mitt resultat
      </Link>
      <Link
        href="/"
        className="text-indigo/70 underline underline-offset-2 dark:text-lavender-400/70"
      >
        Til forsiden
      </Link>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [screen, setScreen] = useState<Screen>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const me = await (await fetch("/api/account/me")).json();
        if (cancelled) return;
        if (!me.loggedIn) {
          setScreen("logged-out");
          return;
        }
        setEmail(me.email ?? null);
        // Rollesjekken gjøres ved å spørre et gatet endepunkt, ikke ved å
        // stole på noe klienten selv vet. Svarer det 401, er man ikke admin.
        const res = await fetch("/api/admin/settings");
        if (cancelled) return;
        setScreen(res.ok ? "ok" : "not-admin");
      } catch {
        if (!cancelled) setScreen("logged-out");
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/account/logout", { method: "POST" });
    setEmail(null);
    setScreen("logged-out");
  }

  if (screen === "loading") return null;

  if (screen === "logged-out") {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-xl font-semibold text-indigo dark:text-white">
          Dine Fasetter admin
        </h1>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Logg inn med e-postadressen din for å få admin-tilgang, dersom kontoen din har
          admin-rolle.
        </p>
        <Link href="/logg-inn" className={buttonClassNames("primary", "md")}>
          Logg inn
        </Link>
        <ExitLinks />
      </main>
    );
  }

  if (screen === "not-admin") {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-xl font-semibold text-indigo dark:text-white">
          Dine Fasetter admin
        </h1>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Du er logget inn som <span className="font-medium">{email}</span>, men denne kontoen har
          ikke admin-tilgang.
        </p>
        <button
          onClick={handleLogout}
          className="text-sm text-holo-skyText underline underline-offset-2"
        >
          Logg ut
        </button>
        <ExitLinks />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-indigo dark:text-white">
            Adminpanel
          </h1>
          <p className="text-xs text-indigo/50 dark:text-lavender-400/50">Innlogget som {email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-indigo/60 underline dark:text-lavender-400/60"
        >
          Logg ut
        </button>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-lavender-400 pb-px dark:border-white/10">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={
                active
                  ? "rounded-t-lg border-b-2 border-holo-skyText px-4 py-2 text-sm font-medium text-indigo dark:text-white"
                  : "rounded-t-lg border-b-2 border-transparent px-4 py-2 text-sm text-indigo/60 hover:text-indigo dark:text-lavender-400/60 dark:hover:text-white"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </main>
  );
}
