"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "./LogoMark";
import { ACCOUNT_SAVE_ENABLED } from "@/lib/featureFlags";
import { ALL_QUESTIONS, ALL_QUESTIONS_EXTENDED, FREE_QUESTIONS } from "@/data/questions";
import { computeTestResult, type ResultTier } from "@/lib/scoring";
import { loadAnswers } from "@/lib/storage";
import { APP_VERSION } from "@/lib/version";

// "Resultat" er bevisst holdt utenfor denne listen -- den rendres separat
// med sin egen rapportvalg-undermeny (se REPORT_OPTIONS/JSX under), men på
// SAMME plass i rekkefølgen som før (mellom Test og Spir).
const LINKS_BEFORE_RESULT = [
  { href: "/", label: "Forside" },
  { href: "/test", label: "Test" },
];
const LINKS_AFTER_RESULT = [{ href: "/spir", label: "Spir" }];

// Rapportvalg-undermenyen under "Resultat" (v2.33, produkteiers ønske
// 19.07.2026): en bruker som har fullført 120 eller 290 spørsmål skal kunne
// velge hvilket av de fullførte rapportnivåene som vises, ikke bare det
// siste/lengste. "unlockKey" er tieren som faktisk må være fullført
// (lokalt, jf. loadAnswers()) for at valget skal være klikkbart.
const REPORT_OPTIONS: readonly { tier: ResultTier; label: string; unlockKey: ResultTier }[] = [
  { tier: "free", label: "50 spørsmål", unlockKey: "free" },
  { tier: "full", label: "120 spørsmål", unlockKey: "full" },
  { tier: "extended", label: "290 spørsmål", unlockKey: "extended" },
];

/**
 * Enkel, gjennomgående navigasjon slik at brukeren kan bevege seg fram og
 * tilbake i løsningen uten å måtte bruke nettleserens tilbake-knapp.
 * Vises ikke på /admin -- det er et eget, avgrenset område (§10.1).
 *
 * v2.28 (kvalitetsrevisjon 19.07.2026): lagt til en innloggingsstatus i selve
 * menyen (ikke bare i bunnteksten) -- brukes både til å hente fram et
 * lagret resultat OG som inngang til admin-panelet, se /logg-inn og
 * lib/admin/roles.ts. Selve kontostatusen (e-post, logg ut, ev. lenke til
 * adminpanelet) vises på /logg-inn for å holde menyen kompakt på mobil.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const [unlocked, setUnlocked] = useState<Record<ResultTier, boolean>>({
    free: false,
    full: false,
    extended: false,
  });
  const reportMenuRef = useRef<HTMLLIElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // v2.34: bugfiks -- undermenyen lukket seg med en gang musepekeren beveget
  // seg NEDOVER fra "Resultat" og inn i selve undermenyen, fordi det lå et
  // reelt dødt område (margin-gap) mellom triggeren og menyen der pekeren
  // ikke lenger var over noe DOM-element som telte som "innenfor" <li>-en --
  // det utløste mouseleave FØR pekeren rakk menyen. Løsning: en liten
  // forsinkelse før lukking (avbrytes hvis pekeren kommer tilbake innenfor
  // kort tid), kombinert med at selve avstanden nå er padding INNI et
  // element som faktisk er en del av hover-treet (se JSX under), ikke en
  // margin utenfor det.
  function openReportMenu() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setReportMenuOpen(true);
  }
  function scheduleCloseReportMenu() {
    closeTimeoutRef.current = setTimeout(() => setReportMenuOpen(false), 200);
  }

  useEffect(() => {
    if (!ACCOUNT_SAVE_ENABLED) return;
    fetch("/api/account/me")
      .then((res) => res.json())
      .then((data) => setLoggedInEmail(data.loggedIn ? (data.email ?? null) : null))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  // Regner ut hvilke av de tre rapportnivåene brukeren faktisk har fullført
  // lokalt -- svarene er kumulative (120-settet inneholder de samme 50
  // spørsmålene som gratisnivået, osv.), så alle tre kan sjekkes uavhengig
  // av hverandre fra samme lagrede svarsett (v2.33). Regnes på nytt ved
  // navigasjon, i tilfelle brukeren nettopp fullførte et nytt nivå.
  useEffect(() => {
    const stored = loadAnswers();
    setUnlocked({
      free: computeTestResult(stored.answers, FREE_QUESTIONS, "free").complete,
      full: computeTestResult(stored.answers, ALL_QUESTIONS, "full").complete,
      extended: computeTestResult(stored.answers, ALL_QUESTIONS_EXTENDED, "extended").complete,
    });
  }, [pathname]);

  // Rydd opp en eventuell ventende lukke-timeout hvis komponenten forsvinner
  // midt i den korte forsinkelsen (se scheduleCloseReportMenu over).
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Lukk undermenyen ved klikk utenfor, eller ved Escape (tastaturstøtte).
  useEffect(() => {
    if (!reportMenuOpen) return;
    function handlePointerDown(e: MouseEvent) {
      if (reportMenuRef.current && !reportMenuRef.current.contains(e.target as Node)) {
        setReportMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setReportMenuOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [reportMenuOpen]);

  if (pathname?.startsWith("/admin")) return null;

  const anyUnlocked = unlocked.free || unlocked.full || unlocked.extended;
  const resultActive = pathname === "/resultat";

  return (
    <header className="sticky top-0 z-10 border-b border-lavender-400 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-indigo/90">
      <nav className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-indigo dark:text-white">
          <LogoMark size={24} />
          Dine Fasetter
          <span className="rounded-full bg-lavender-100 px-2 py-0.5 text-xs font-normal text-indigo/60 dark:bg-white/10 dark:text-lavender-400/70">
            Beta v{APP_VERSION}
          </span>
        </Link>
        <ul className="flex items-center gap-4 text-sm">
          {LINKS_BEFORE_RESULT.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "font-medium text-holo-skyText"
                      : "text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70"
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}

          {/* Rapportvalg (v2.33): rollover-undermeny under "Resultat" der
              fullførte nivåer (50/120/290) er klikkbare og ulåste nivåer
              vises gråtonet og ikke-klikkbare -- se REPORT_OPTIONS over.
              Åpnes ved museover (desktop) OG ved klikk på pil-knappen
              (berøring/tastatur), lukkes ved klikk utenfor eller Escape. */}
          <li
            key="/resultat"
            ref={reportMenuRef}
            className="relative"
            onMouseEnter={() => anyUnlocked && openReportMenu()}
            onMouseLeave={scheduleCloseReportMenu}
          >
            <div className="flex items-center gap-0.5">
              <Link
                href="/resultat"
                aria-current={resultActive ? "page" : undefined}
                className={
                  resultActive
                    ? "font-medium text-holo-skyText"
                    : "text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70"
                }
              >
                Resultat
              </Link>
              {anyUnlocked && (
                <button
                  type="button"
                  aria-expanded={reportMenuOpen}
                  aria-controls="resultat-rapportvalg"
                  aria-label="Vis rapportvalg (50, 120 eller 290 spørsmål)"
                  onClick={() => setReportMenuOpen((v) => !v)}
                  className="rounded p-0.5 text-indigo/50 hover:text-holo-skyText dark:text-lavender-400/50"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M1,3 L5,7 L9,3" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>

            {reportMenuOpen && (
              // Ytre "bro"-element: starter helt uten mellomrom (top-full,
              // ingen margin) rett under triggeren, slik at det IKKE finnes
              // noe dødt område mellom dem -- selve den visuelle avstanden
              // ligger som padding-top INNI denne broen (fortsatt en del av
              // <li>-ens hover-undertre), ikke som margin utenfor den.
              <div className="absolute left-0 top-full z-20 w-40 pt-2">
                <ul
                  id="resultat-rapportvalg"
                  role="menu"
                  aria-label="Velg rapport"
                  className="rounded-xl border border-lavender-400/40 bg-white py-1.5 shadow-md dark:border-white/10 dark:bg-indigo"
                >
                  {REPORT_OPTIONS.map((opt) => {
                    const isUnlocked = unlocked[opt.unlockKey];
                    return (
                      <li key={opt.tier} role="none">
                        {isUnlocked ? (
                          <Link
                            role="menuitem"
                            href={`/resultat?tier=${opt.tier}`}
                            onClick={() => setReportMenuOpen(false)}
                            className="block px-3 py-1.5 text-indigo hover:bg-lavender-100 dark:text-white dark:hover:bg-white/10"
                          >
                            {opt.label}
                          </Link>
                        ) : (
                          <span
                            role="menuitem"
                            aria-disabled="true"
                            className="block cursor-not-allowed px-3 py-1.5 text-indigo/30 dark:text-lavender-400/30"
                          >
                            {opt.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>

          {LINKS_AFTER_RESULT.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "font-medium text-holo-skyText"
                      : "text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70"
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {ACCOUNT_SAVE_ENABLED && (
            <li>
              <Link
                href="/logg-inn"
                aria-current={pathname === "/logg-inn" ? "page" : undefined}
                className={
                  pathname === "/logg-inn"
                    ? "font-medium text-holo-skyText"
                    : "text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70"
                }
              >
                {!checked ? "Konto" : loggedInEmail ? "Min konto" : "Logg inn"}
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
