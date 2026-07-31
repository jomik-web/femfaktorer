"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "./LogoMark";
import { useFlags } from "@/components/FlagsProvider";
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

// Verktøy-undermenyen (v2.44, produkteiers ønske 31.07.2026). Kontolagringen
// lå tidligere som en full seksjon på /resultat og fylte mye plass med å
// forklare en funksjon som er avslått under betatestingen -- den hører hjemme
// blant verktøyene, ikke i selve rapporten.
//
// I motsetning til REPORT_OPTIONS over er disse ALLTID klikkbare: de handler
// om å ta vare på data, ikke om å vise et resultat som må være fullført
// først. Sidene sier selv fra hvis det ikke er noe å lagre ennå.
//
// Holdes manuelt i synk med TOOLS-listen i app/verktoy/page.tsx.
const VERKTOY_OPTIONS = [
  { href: "/verktoy/svardata", label: "Svardata" },
  { href: "/verktoy/lagre-resultat", label: "Lagre resultatet" },
] as const;

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
  // v2.45: styres nå fra adminpanelet, ikke av en konstant som er låst ved bygg.
  const { accountSaveEnabled } = useFlags();
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const [verktoyMenuOpen, setVerktoyMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unlocked, setUnlocked] = useState<Record<ResultTier, boolean>>({
    free: false,
    full: false,
    extended: false,
  });
  const reportMenuRef = useRef<HTMLLIElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verktoyMenuRef = useRef<HTMLLIElement>(null);
  const verktoyCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // v2.42 (Kvalitetsrevisjon 31.07.2026, kap. 1, lav alvorlighet): mobilpanelet
  // flyttet tidligere ALDRI fokus -- det ble stående på hamburgerknappen både
  // ved åpning og lukking. Ikke et WCAG-brudd i seg selv (panelet er ikke
  // modalt), men fokusflytt til første lenke ved åpning sparer
  // tastaturbrukere for å måtte Tabbe forbi en nå-skjult knapp, og flytt
  // tilbake til knappen ved Escape gjør at fokus ikke blir "hengende" på et
  // element som ikke lenger er synlig relevant.
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

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

  // Samme "bro"-mønster som rapportmenyen over, av samme grunn (v2.34-fiksen).
  function openVerktoyMenu() {
    if (verktoyCloseTimeoutRef.current) {
      clearTimeout(verktoyCloseTimeoutRef.current);
      verktoyCloseTimeoutRef.current = null;
    }
    setVerktoyMenuOpen(true);
  }
  function scheduleCloseVerktoyMenu() {
    verktoyCloseTimeoutRef.current = setTimeout(() => setVerktoyMenuOpen(false), 200);
  }

  useEffect(() => {
    if (!accountSaveEnabled) return;
    fetch("/api/account/me")
      .then((res) => res.json())
      .then((data) => setLoggedInEmail(data.loggedIn ? (data.email ?? null) : null))
      .catch(() => {})
      .finally(() => setChecked(true));
    // accountSaveEnabled er med i avhengighetene fordi bryteren hentes
    // asynkront (se FlagsProvider) -- uten den ville effekten kjørt én gang
    // med standardverdien og aldri sett en endring fra adminpanelet.
  }, [accountSaveEnabled]);

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
      if (verktoyCloseTimeoutRef.current) clearTimeout(verktoyCloseTimeoutRef.current);
    };
  }, []);

  // Lukk mobilmenyen automatisk ved sidebytte -- ellers ville den blitt
  // stående åpen over neste side etter et lenkeklikk.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Mobilmeny: lukk med Escape (samme tastaturstøtte som rapportvalg-menyen),
  // og flytt fokus tilbake til hamburgerknappen når det skjer.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Flytt fokus til første lenke i panelet så snart det åpnes.
  useEffect(() => {
    if (mobileMenuOpen) firstMobileLinkRef.current?.focus();
  }, [mobileMenuOpen]);

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

  // Samme lukkeatferd for verktøymenyen (klikk utenfor / Escape).
  useEffect(() => {
    if (!verktoyMenuOpen) return;
    function handlePointerDown(e: MouseEvent) {
      if (verktoyMenuRef.current && !verktoyMenuRef.current.contains(e.target as Node)) {
        setVerktoyMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setVerktoyMenuOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [verktoyMenuOpen]);

  if (pathname?.startsWith("/admin")) return null;

  const anyUnlocked = unlocked.free || unlocked.full || unlocked.extended;
  const resultActive = pathname === "/resultat";
  const verktoyActive = pathname?.startsWith("/verktoy") ?? false;

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

        {/* Mobilmeny-knapp (kvalitetsrevisjon 2026-07-24, kritisk funn):
            menyen under hadde tidligere ingen responsiv strategi i det hele
            tatt (0 breakpoints), med risiko for overflow/sammenklemming på
            smale skjermer. Under md-breakpoktet skjules listen til fordel
            for denne knappen + panelet lenger ned. */}
        <button
          ref={mobileMenuButtonRef}
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobil-meny"
          aria-label={mobileMenuOpen ? "Lukk meny" : "Åpne meny"}
          className="rounded p-1.5 text-indigo hover:bg-lavender-100 dark:text-white dark:hover:bg-white/10 md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            {mobileMenuOpen ? (
              <path
                d="M5,5 L17,17 M17,5 L5,17"
                stroke="currentColor"
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3,6 L19,6 M3,11 L19,11 M3,16 L19,16"
                stroke="currentColor"
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>

        <ul className="hidden items-center gap-4 text-sm md:flex">
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
          {/* Verktøy (v2.44) -- samme rollover-mønster som rapportvalg over. */}
          <li
            key="/verktoy"
            ref={verktoyMenuRef}
            className="relative"
            onMouseEnter={openVerktoyMenu}
            onMouseLeave={scheduleCloseVerktoyMenu}
          >
            <div className="flex items-center gap-0.5">
              <Link
                href="/verktoy"
                aria-current={verktoyActive ? "page" : undefined}
                className={
                  verktoyActive
                    ? "font-medium text-holo-skyText"
                    : "text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70"
                }
              >
                Verktøy
              </Link>
              <button
                type="button"
                aria-expanded={verktoyMenuOpen}
                aria-controls="verktoy-undermeny"
                aria-label="Vis verktøy"
                onClick={() => setVerktoyMenuOpen((v) => !v)}
                className="rounded p-0.5 text-indigo/50 hover:text-holo-skyText dark:text-lavender-400/50"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M1,3 L5,7 L9,3" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {verktoyMenuOpen && (
              <div className="absolute left-0 top-full z-20 w-48 pt-2">
                <ul
                  id="verktoy-undermeny"
                  role="menu"
                  aria-label="Velg verktøy"
                  className="rounded-xl border border-lavender-400/40 bg-white py-1.5 shadow-md dark:border-white/10 dark:bg-indigo"
                >
                  {VERKTOY_OPTIONS.map((opt) => (
                    <li key={opt.href} role="none">
                      <Link
                        role="menuitem"
                        href={opt.href}
                        onClick={() => setVerktoyMenuOpen(false)}
                        className="block px-3 py-1.5 text-indigo hover:bg-lavender-100 dark:text-white dark:hover:bg-white/10"
                      >
                        {opt.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>

          {accountSaveEnabled && (
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

      {/* Mobilpanel -- flat, vertikal liste av de samme lenkene som
          desktop-menyen over, inkludert rapportvalgene inline (uten egen
          hover-undermeny, som ikke gir mening på berøring). Lukkes ved
          sidebytte, Escape, eller ny knappeklikk (se useEffect-ene over). */}
      {mobileMenuOpen && (
        <div id="mobil-meny" className="border-t border-lavender-400 bg-white px-6 py-3 dark:border-white/10 dark:bg-indigo md:hidden">
          <ul className="flex flex-col gap-1 text-sm">
            {LINKS_BEFORE_RESULT.map((link, i) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    ref={i === 0 ? firstMobileLinkRef : undefined}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      "block rounded px-2 py-2 " +
                      (active
                        ? "font-medium text-holo-skyText"
                        : "text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70")
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}

            <li>
              <Link
                href="/resultat"
                aria-current={resultActive ? "page" : undefined}
                className={
                  "block rounded px-2 py-2 " +
                  (resultActive
                    ? "font-medium text-holo-skyText"
                    : "text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70")
                }
              >
                Resultat
              </Link>
              {anyUnlocked && (
                <ul className="flex flex-col gap-1 pl-4">
                  {REPORT_OPTIONS.map((opt) => {
                    const isUnlocked = unlocked[opt.unlockKey];
                    return (
                      <li key={opt.tier}>
                        {isUnlocked ? (
                          <Link
                            href={`/resultat?tier=${opt.tier}`}
                            className="block rounded px-2 py-1.5 text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70"
                          >
                            {opt.label}
                          </Link>
                        ) : (
                          <span aria-disabled="true" className="block cursor-not-allowed px-2 py-1.5 text-indigo/30 dark:text-lavender-400/30">
                            {opt.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
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
                      "block rounded px-2 py-2 " +
                      (active
                        ? "font-medium text-holo-skyText"
                        : "text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70")
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {/* Verktøy med undervalgene inline -- samme mønster som
                rapportvalgene over (ingen hover-undermeny på berøring). */}
            <li>
              <Link
                href="/verktoy"
                aria-current={verktoyActive ? "page" : undefined}
                className={
                  "block rounded px-2 py-2 " +
                  (verktoyActive
                    ? "font-medium text-holo-skyText"
                    : "text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70")
                }
              >
                Verktøy
              </Link>
              <ul className="flex flex-col gap-1 pl-4">
                {VERKTOY_OPTIONS.map((opt) => (
                  <li key={opt.href}>
                    <Link
                      href={opt.href}
                      className="block rounded px-2 py-1.5 text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70"
                    >
                      {opt.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {accountSaveEnabled && (
              <li>
                <Link
                  href="/logg-inn"
                  aria-current={pathname === "/logg-inn" ? "page" : undefined}
                  className={
                    "block rounded px-2 py-2 " +
                    (pathname === "/logg-inn"
                      ? "font-medium text-holo-skyText"
                      : "text-indigo/70 hover:text-holo-skyText dark:text-lavender-400/70")
                  }
                >
                  {!checked ? "Konto" : loggedInEmail ? "Min konto" : "Logg inn"}
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
