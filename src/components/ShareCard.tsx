"use client";

import { useId, useMemo, useRef, useState } from "react";
import { FactorHeroContent, COLORS, VIEWBOX_WIDTH, VIEWBOX_HEIGHT } from "@/components/FactorHero";
import type { FactorResult } from "@/lib/scoring";
import { bandFor, INTERPRETATIONS, pickDominantFactor } from "@/data/interpretations";
import {
  SHARE_FORMATS,
  GENERIC_SHARE_TEXT,
  svgElementToPngBlob,
  downloadBlob,
  shareImageFile,
  buildPlatformShareUrls,
  type ShareFormat,
} from "@/lib/shareCard";

/**
 * Delbart Spir-motiv-kort (v2.37, produkteiers ønske 25.07.2026), vist til
 * slutt på rapporten (se resultat/page.tsx). Viser motivet for faktoren
 * som peker seg tydeligst ut hos brukeren (se `pickDominantFactor`), i tre
 * ferdigkomponerte formater tilpasset ulike sosiale medier -- IKKE bare
 * samme bilde skalert, se lib/shareCard.ts filhode og formatvalgene under.
 *
 * Alt skjer i nettleseren: bildet genereres på klientsiden (SVG -> canvas
 * -> PNG), lastes aldri opp til en server, og krever ingen innlogging på
 * noe sosialt medie -- brukeren deler via sin egen enhets native deleark,
 * eller laster ned bildet og legger det ved selv.
 */
export function ShareCard({ factors }: { factors: FactorResult[] }) {
  const dominant = useMemo(() => pickDominantFactor(factors), [factors]);
  const band = bandFor(dominant.score);
  const tagline = INTERPRETATIONS[dominant.factor][band].shareTagline;

  const [format, setFormat] = useState<ShareFormat>("square");
  const [busy, setBusy] = useState<"share" | "download" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const squareRef = useRef<SVGSVGElement>(null);
  const storyRef = useRef<SVGSVGElement>(null);
  const linkRef = useRef<SVGSVGElement>(null);
  const refs: Record<ShareFormat, React.RefObject<SVGSVGElement | null>> = {
    square: squareRef,
    story: storyRef,
    link: linkRef,
  };

  const uidBase = useId();
  const spec = SHARE_FORMATS[format];

  const siteUrl =
    (typeof window !== "undefined" && window.location.origin) || "https://dinefasetter.no";
  const platformUrls = buildPlatformShareUrls(siteUrl);

  async function renderCurrentToBlob(): Promise<Blob | null> {
    const svg = refs[format].current;
    if (!svg) return null;
    try {
      return await svgElementToPngBlob(svg, spec.width, spec.height);
    } catch {
      setFeedback("Klarte ikke å lage bildet akkurat nå -- prøv igjen.");
      return null;
    }
  }

  async function handleShare() {
    setBusy("share");
    setFeedback(null);
    const blob = await renderCurrentToBlob();
    if (!blob) {
      setBusy(null);
      return;
    }
    const shared = await shareImageFile(blob, spec.filename, GENERIC_SHARE_TEXT);
    if (!shared) {
      // Nettleseren støtter ikke fildeling -- fall tilbake til nedlasting,
      // slik at knappen uansett gjør NOE nyttig i stedet for å feile stille.
      downloadBlob(blob, spec.filename);
      setFeedback("Bildet ble lastet ned i stedet -- del det manuelt fra nedlastingene dine.");
    }
    setBusy(null);
  }

  async function handleDownload() {
    setBusy("download");
    setFeedback(null);
    const blob = await renderCurrentToBlob();
    if (blob) {
      downloadBlob(blob, spec.filename);
      setFeedback("Bildet er lastet ned.");
    }
    setBusy(null);
  }

  // Feature-detect kun til å avgjøre om "Del bildet"-knappen skal vises i
  // det hele tatt -- selve delingen sjekker på nytt når den faktiske filen finnes.
  const nativeShareLikelySupported =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-lavender-400/30 bg-lavender-100/40 p-5 print:hidden dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display font-semibold text-indigo dark:text-white">Del resultatet ditt</h2>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Dette kortet viser {dominant.label.toLowerCase()} -- trekket som peker seg tydeligst ut i
          profilen din. Bildet lages i nettleseren din og lastes aldri opp noe sted -- du deler det
          selv, uten å logge inn på noen sosiale medier fra oss.
        </p>
      </div>

      {/* Formatvelger */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Velg delingsformat">
        {(Object.keys(SHARE_FORMATS) as ShareFormat[]).map((key) => {
          const active = format === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setFormat(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-holo-sky text-indigo"
                  : "bg-lavender-100 text-indigo/70 hover:bg-lavender-400/30 dark:bg-white/10 dark:text-lavender-400/70"
              }`}
            >
              {SHARE_FORMATS[key].label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-indigo/50 dark:text-lavender-400/50">{spec.platforms}</p>

      {/* Live forhåndsvisning -- samme SVG som brukes til selve eksporten, kun vist mindre. */}
      <div className="overflow-hidden rounded-xl">
        <svg
          viewBox={`0 0 ${spec.width} ${spec.height}`}
          className="block h-auto w-full max-w-sm"
          role="img"
          aria-label={`Delbart kort: ${dominant.label}`}
        >
          <CardMarkup
            format="square"
            factor={dominant.factor}
            label={dominant.label}
            tagline={tagline}
            uid={`${uidBase}-preview`}
            visible={format === "square"}
          />
          <CardMarkup
            format="story"
            factor={dominant.factor}
            label={dominant.label}
            tagline={tagline}
            uid={`${uidBase}-preview`}
            visible={format === "story"}
          />
          <CardMarkup
            format="link"
            factor={dominant.factor}
            label={dominant.label}
            tagline={tagline}
            uid={`${uidBase}-preview`}
            visible={format === "link"}
          />
        </svg>
      </div>

      {/* Skjulte eksport-SVG-er i full oppløsning, én per format -- alltid i DOM-en
          (uavhengig av hvilken som vises over) slik at hvilken som helst kan
          rasteriseres til PNG med én gang uten en ekstra rendrings-runde. */}
      <div className="hidden" aria-hidden="true">
        <svg ref={squareRef} viewBox="0 0 1080 1080" width={1080} height={1080}>
          <CardMarkup
            format="square"
            factor={dominant.factor}
            label={dominant.label}
            tagline={tagline}
            uid={`${uidBase}-square`}
            visible
          />
        </svg>
        <svg ref={storyRef} viewBox="0 0 1080 1920" width={1080} height={1920}>
          <CardMarkup
            format="story"
            factor={dominant.factor}
            label={dominant.label}
            tagline={tagline}
            uid={`${uidBase}-story`}
            visible
          />
        </svg>
        <svg ref={linkRef} viewBox="0 0 1200 630" width={1200} height={630}>
          <CardMarkup
            format="link"
            factor={dominant.factor}
            label={dominant.label}
            tagline={tagline}
            uid={`${uidBase}-link`}
            visible
          />
        </svg>
      </div>

      <div className="flex flex-wrap gap-3">
        {nativeShareLikelySupported && (
          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={busy !== null}
            className="rounded-xl bg-holo-sky px-5 py-2.5 text-sm font-semibold text-indigo shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            {busy === "share" ? "Åpner deleark …" : "Del bildet"}
          </button>
        )}
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={busy !== null}
          className="rounded-xl bg-lavender-100 px-5 py-2.5 text-sm font-semibold text-indigo hover:bg-lavender-400/40 disabled:opacity-50 dark:bg-white/10 dark:text-white"
        >
          {busy === "download" ? "Lager bilde …" : "Last ned bildet"}
        </button>
      </div>
      {feedback && <p className="text-sm text-indigo/70 dark:text-lavender-400/70">{feedback}</p>}

      <div className="flex flex-col gap-2 border-t border-indigo/10 pt-3 dark:border-white/10">
        <p className="text-xs text-indigo/60 dark:text-lavender-400/60">
          Vil du heller dele en lenke til testen, uten bildet vedlagt automatisk?
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href={platformUrls.x} target="_blank" rel="noopener noreferrer" className="text-holo-skyText underline underline-offset-2">
            X
          </a>
          <a href={platformUrls.facebook} target="_blank" rel="noopener noreferrer" className="text-holo-skyText underline underline-offset-2">
            Facebook
          </a>
          <a href={platformUrls.whatsapp} target="_blank" rel="noopener noreferrer" className="text-holo-skyText underline underline-offset-2">
            WhatsApp
          </a>
          <a href={platformUrls.linkedin} target="_blank" rel="noopener noreferrer" className="text-holo-skyText underline underline-offset-2">
            LinkedIn
          </a>
          <a href={platformUrls.email} className="text-holo-skyText underline underline-offset-2">
            E-post
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------- Kort-komposisjon per format ----------

interface CardMarkupProps {
  format: ShareFormat;
  factor: FactorResult["factor"];
  label: string;
  tagline: string;
  uid: string;
  visible: boolean;
}

const PANEL_BG = COLORS.indigo;

/**
 * Selve komposisjonen: motiv + tekstpanel/scrim, forskjellig oppsett per
 * format (se lib/shareCard.ts filhode for resonnementet bak hvert valg).
 * `visible` styrer kun om DENNE varianten faktisk tegnes i forhåndsvisnings-
 * `<svg>`-en (som inneholder alle tre oppå hverandre) -- eksport-SVG-ene
 * bruker alltid `visible=true` siden de har én variant hver for seg selv.
 */
/** Felles bunntekst (ordmerke + disclaimer) -- identisk plassering (i px fra bunnen) på alle tre formater. */
function CardFooter({ width, totalHeight, color }: { width: number; totalHeight: number; color: string }) {
  return (
    <>
      <text
        x={width / 2}
        y={totalHeight - 48}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize={26}
        fill={color}
        opacity={0.6}
      >
        Dine Fasetter -- en norsk personlighetstest
      </text>
      <text
        x={width / 2}
        y={totalHeight - 18}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize={18}
        fill={color}
        opacity={0.45}
      >
        Ikke en klinisk vurdering
      </text>
    </>
  );
}

function CardMarkup({ format, factor, label, tagline, uid, visible }: CardMarkupProps) {
  if (!visible) return null;
  const factorColor = COLORS[factor as keyof typeof COLORS] ?? COLORS.holoSky;
  const glowId = `glow-${uid}`;

  if (format === "link") {
    // Liggende lenkekort: motivet dekker HELE flaten kant-til-kant (skalert
    // til å fylle høyden 630, med et lite beskjæringstrekk i bredden) --
    // rektangel-klipp i stedet for den bølgete masken, se
    // FactorHeroContent sin `edgeToEdge`-modus. Mørk scrim nederst for lesbar tekst.
    const scale = 630 / VIEWBOX_HEIGHT;
    const scaledWidth = VIEWBOX_WIDTH * scale;
    const xOffset = (1200 - scaledWidth) / 2;
    const scrimId = `scrim-${uid}`;
    return (
      <>
        <rect width={1200} height={630} fill={PANEL_BG} />
        <g transform={`translate(${xOffset},0) scale(${scale})`}>
          <FactorHeroContent factor={factor} uid={uid} edgeToEdge />
        </g>
        <defs>
          <linearGradient id={scrimId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={PANEL_BG} stopOpacity={0} />
            <stop offset="100%" stopColor={PANEL_BG} stopOpacity={0.92} />
          </linearGradient>
        </defs>
        <rect x={0} y={380} width={1200} height={250} fill={`url(#${scrimId})`} />
        <text x={48} y={500} fontFamily="Arial, sans-serif" fontWeight={700} fontSize={52} fill="white">
          {label}
        </text>
        <text x={48} y={548} fontFamily="Arial, sans-serif" fontSize={30} fill={COLORS.lavender100}>
          {tagline}
        </text>
        <text x={48} y={598} fontFamily="Arial, sans-serif" fontSize={22} fill={COLORS.lavender100} opacity={0.7}>
          Dine Fasetter -- en norsk personlighetstest
        </text>
      </>
    );
  }

  if (format === "story") {
    // Story: et rent kvadratisk/bredde-tilpasset motiv etterlot et altfor
    // stort, tomt mørkt felt under på et så høyt lerret (bekreftet visuelt
    // under utvikling) -- løst med samme kant-til-kant-beskjæring som det
    // liggende formatet, men til et TALLERE bånd (~720px), pluss en myk
    // fargeglød bak teksten (samme visuelle grep som gløden bak Spir på
    // forsiden) for å unngå et flatt, livløst tomrom.
    const motifHeight = 720;
    const scale = motifHeight / VIEWBOX_HEIGHT;
    const scaledWidth = VIEWBOX_WIDTH * scale;
    const xOffset = (1080 - scaledWidth) / 2;
    return (
      <>
        <rect width={1080} height={1920} fill={PANEL_BG} />
        <g transform={`translate(${xOffset},0) scale(${scale})`}>
          <FactorHeroContent factor={factor} uid={uid} edgeToEdge />
        </g>
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>
        <circle cx={540} cy={motifHeight + 330} r={260} fill={factorColor} opacity={0.18} filter={`url(#${glowId})`} />
        <text x={540} y={motifHeight + 280} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={68} fill="white">
          {label}
        </text>
        <text x={540} y={motifHeight + 356} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={42} fill={COLORS.lavender100}>
          {tagline}
        </text>
        <CardFooter width={1080} totalHeight={1920} color={COLORS.lavender100} />
      </>
    );
  }

  // Kvadrat: motivet fyller bredden med den vanlige bølgede kanten (samme
  // mask som på selve rapportsiden) som toner ut mot panelet under.
  const scale = 1080 / VIEWBOX_WIDTH;
  const motifHeight = VIEWBOX_HEIGHT * scale;
  return (
    <>
      <rect width={1080} height={1080} fill={PANEL_BG} />
      <g transform={`scale(${scale})`}>
        <FactorHeroContent factor={factor} uid={uid} />
      </g>
      <text x={540} y={motifHeight + 275} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={60} fill="white">
        {label}
      </text>
      <text x={540} y={motifHeight + 339} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={36} fill={COLORS.lavender100}>
        {tagline}
      </text>
      <CardFooter width={1080} totalHeight={1080} color={COLORS.lavender100} />
    </>
  );
}

export default ShareCard;
