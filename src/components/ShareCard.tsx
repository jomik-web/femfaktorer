"use client";

import { useId, useMemo, useRef, useState } from "react";
import { FactorHeroContent, COLORS, VIEWBOX_WIDTH, VIEWBOX_HEIGHT } from "@/components/FactorHero";
import type { FactorResult, FacetResult } from "@/lib/scoring";
import { bandFor, INTERPRETATIONS, pickDominantFactor } from "@/data/interpretations";
import { pickMemeCards, pickDomainMemeCard, type MemeCardAsset } from "@/data/memeCards";
import {
  SHARE_FORMATS,
  GENERIC_SHARE_TEXT,
  svgElementToPngBlob,
  downloadBlob,
  shareImageFile,
  type ShareFormat,
} from "@/lib/shareCard";

/**
 * Delbart Spir-kort, vist til slutt på rapporten (se resultat/page.tsx).
 *
 * v2.38 (produkteiers ønske 26.07.2026): når brukeren har fasettdata (full/
 * utvidet-tier) OG minst én av dens mest utpregede fasetter har et ferdig
 * AI-illustrert meme-kort (se data/memeCards.ts), vises 2-3 alternative
 * meme-kort å velge mellom -- de fasettene som ligger lengst fra midten
 * (50), altså de mest "utpregede"/meme-bare, IKKE nødvendigvis den samme
 * fasetten som driver hovedkategoriteksten andre steder i rapporten.
 * Brukeren velger selv hvilket av de foreslåtte kortene som skal deles.
 *
 * v3.0 (produkteiers ønske 27.07.2026): gratis-tieren (50 spørsmål) har
 * ALDRI fasettdata, så `pickMemeCards` returnerer alltid tomt for disse
 * brukerne -- de faller nå isteden tilbake på ETT domenenivå-kort (bredt
 * sitat, ikke låst til én fasett-nyanse, se `pickDomainMemeCard` og
 * DOMAIN_MEME_CARDS i data/memeCards.ts) fremfor å hoppe rett til det
 * gamle SVG-kortet.
 *
 * FALLBACK til det opprinnelige, SVG-genererte domenekortet (v2.37) når
 * verken fasett- eller domenenivå-kort finnes for brukerens profil ennå
 * (typisk: en tidlig fase i meme-kort-produksjonen der akkurat DENNE
 * brukerens mest utpregede kategori ikke er dekket ennå), ELLER dersom
 * bildefilen faktisk feiler å laste i nettleseren (se `onError` under --
 * DOMAIN_MEME_CARDS kan inneholde placeholder-stier til bilder som ennå
 * ikke er produsert, se filhode i data/memeCards.ts) -- se
 * `pickDominantFactor`/CardMarkup under.
 *
 * Alt skjer i nettleseren: ingen opplasting til en server, ingen innlogging
 * på noe sosialt medie -- brukeren deler via sin egen enhets native
 * deleark, eller laster ned bildet og legger det ved selv.
 */
export function ShareCard({ factors, facets }: { factors: FactorResult[]; facets?: FacetResult[] }) {
  const memeCandidates = useMemo(() => pickMemeCards(facets ?? [], 3), [facets]);
  const domainCandidate = useMemo(
    () => (memeCandidates.length === 0 ? pickDomainMemeCard(factors) : null),
    [memeCandidates, factors]
  );
  const [artUnavailable, setArtUnavailable] = useState(false);

  if (memeCandidates.length > 0 && !artUnavailable) {
    const items = memeCandidates.map((c) => ({ key: c.facet.facet, asset: c.asset }));
    return <MemeShareCard items={items} onArtMissing={() => setArtUnavailable(true)} />;
  }
  if (domainCandidate && !artUnavailable) {
    const items = [{ key: domainCandidate.factor.factor, asset: domainCandidate.asset }];
    return <MemeShareCard items={items} onArtMissing={() => setArtUnavailable(true)} />;
  }
  return <DomainShareCard factors={factors} />;
}

// ---------- v2.38/v3.0: meme-kort-modus (fasett- ELLER domenenivå, faktiske illustrasjoner) ----------

/** Story vises som standard og står til venstre i formatvelgeren (produkteiers ønske 26.07.2026) -- IKKE samme rekkefølge som SHARE_FORMATS-objektet (der square står først av historiske årsaker). */
const FORMAT_ORDER: ShareFormat[] = ["story", "square"];

/** Ett delbart kort-alternativ -- `key` er fasettkoden ("C6") eller domenenavnet ("stability"), avhengig av om ShareCard fant fasett- eller domenenivå-kandidater (se ShareCard over). */
interface MemeShareItem {
  key: string;
  asset: MemeCardAsset;
}

function MemeShareCard({ items, onArtMissing }: { items: MemeShareItem[]; onArtMissing: () => void }) {
  const [selectedKey, setSelectedKey] = useState(items[0]!.key);
  const [format, setFormat] = useState<ShareFormat>("story");
  const [busy, setBusy] = useState<"share" | "download" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selected = items.find((c) => c.key === selectedKey) ?? items[0]!;
  const spec = SHARE_FORMATS[format];
  const imgSrc = format === "square" ? selected.asset.square : selected.asset.story;

  async function fetchCurrentAsBlob(): Promise<Blob | null> {
    try {
      const res = await fetch(imgSrc);
      if (!res.ok) throw new Error("Bildet kunne ikke hentes.");
      return await res.blob();
    } catch {
      setFeedback("Klarte ikke å laste bildet akkurat nå -- prøv igjen.");
      return null;
    }
  }

  async function handleShare() {
    setBusy("share");
    setFeedback(null);
    const blob = await fetchCurrentAsBlob();
    if (!blob) {
      setBusy(null);
      return;
    }
    const shared = await shareImageFile(blob, spec.filename, GENERIC_SHARE_TEXT);
    if (!shared) {
      downloadBlob(blob, spec.filename);
      setFeedback("Bildet ble lastet ned i stedet -- del det manuelt fra nedlastingene dine.");
    }
    setBusy(null);
  }

  async function handleDownload() {
    setBusy("download");
    setFeedback(null);
    const blob = await fetchCurrentAsBlob();
    if (blob) {
      downloadBlob(blob, spec.filename);
      setFeedback("Bildet er lastet ned.");
    }
    setBusy(null);
  }

  const nativeShareLikelySupported =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-holo-sky/45 bg-gold-light/6 p-5 print:hidden dark:border-white/15 dark:bg-gold-light/3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display font-semibold text-indigo dark:text-white">Del resultatet ditt</h2>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Spir har laget noen kort ut fra det som peker seg mest ut i profilen din -- velg det du liker best.
        </p>
      </div>

      {/* Formatvelger -- Story til venstre og vist som standard (produkteiers ønske 26.07.2026). */}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Velg delingsformat">
        {FORMAT_ORDER.map((key) => {
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

      {/* Kort-velger OG forhåndsvisning i ett (v2.39, produkteiers ønske
          26.07.2026): de faktiske kandidat-bildene vises side ved side (på
          bredere skjermer) eller under hverandre (mobil) -- IKKE tekst-piller
          med utdrag av sitatet lenger. Bildene selv ER forhåndsvisningen; det
          valgte kortet får en tydelig ring-markering. Alle vises i samme
          format som er valgt over (story/firkant). Bevisst naturlig aspect
          ratio (height: auto) -- se data/memeCards.ts filhode om hvorfor
          kortene ikke er 100 % ensartede i høyde. */}
      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-start"
        role="radiogroup"
        aria-label="Velg hvilket kort som vises"
      >
        {items.map((c) => {
          const active = c.key === selectedKey;
          const src = format === "square" ? c.asset.square : c.asset.story;
          return (
            <button
              key={c.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelectedKey(c.key)}
              className={`flex flex-col gap-2 rounded-xl p-1 text-left transition-shadow ${
                items.length > 1 ? "sm:w-1/3" : "sm:max-w-xs"
              } ${
                active
                  ? "ring-2 ring-holo-sky ring-offset-2 ring-offset-lavender-100 dark:ring-offset-transparent"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <span className="overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element -- statisk, ferdig-komponert bilde, ikke egnet for next/image-optimalisering */}
                <img
                  src={src}
                  alt={`Delbart kort: ${c.asset.quote}`}
                  className="block h-auto w-full"
                  // Bildet finnes ikke ennå (typisk domenenivå-kort før
                  // ChatGPT-batchen er produsert, se DOMAIN_MEME_CARDS i
                  // data/memeCards.ts) -- fall tilbake til det gamle
                  // SVG-domenekortet i stedet for et synlig ødelagt bilde.
                  onError={onArtMissing}
                />
              </span>
            </button>
          );
        })}
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
          {busy === "download" ? "Laster ned …" : "Last ned bildet"}
        </button>
      </div>
      {feedback && <p className="text-sm text-indigo/70 dark:text-lavender-400/70">{feedback}</p>}
    </section>
  );
}

// ---------- v2.37: fallback -- SVG-generert domenekort (ingen meme-kort tilgjengelig ennå) ----------

function DomainShareCard({ factors }: { factors: FactorResult[] }) {
  const dominant = useMemo(() => pickDominantFactor(factors), [factors]);
  const band = bandFor(dominant.score);
  const tagline = INTERPRETATIONS[dominant.factor][band].shareTagline;

  const [format, setFormat] = useState<ShareFormat>("square");
  const [busy, setBusy] = useState<"share" | "download" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const squareRef = useRef<SVGSVGElement>(null);
  const storyRef = useRef<SVGSVGElement>(null);
  const refs: Record<ShareFormat, React.RefObject<SVGSVGElement | null>> = {
    square: squareRef,
    story: storyRef,
  };

  const uidBase = useId();
  const spec = SHARE_FORMATS[format];

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
    <section className="flex flex-col gap-4 rounded-2xl border border-holo-sky/45 bg-gold-light/6 p-5 print:hidden dark:border-white/15 dark:bg-gold-light/3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display font-semibold text-indigo dark:text-white">Del resultatet ditt</h2>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Bildet lages i nettleseren din -- ingen innlogging.
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
 * Selve komposisjonen: motiv + tekstpanel, forskjellig oppsett per format
 * (se lib/shareCard.ts filhode for resonnementet bak hvert valg). `visible`
 * styrer kun om DENNE varianten faktisk tegnes i forhåndsvisnings-`<svg>`-en
 * (som inneholder begge oppå hverandre) -- eksport-SVG-ene bruker alltid
 * `visible=true` siden de har én variant hver for seg selv.
 */
/** Felles bunntekst (ordmerke + disclaimer) -- identisk plassering (i px fra bunnen) på begge formater. */
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

  if (format === "story") {
    // Story: et rent kvadratisk/bredde-tilpasset motiv etterlot et altfor
    // stort, tomt mørkt felt under på et så høyt lerret (bekreftet visuelt
    // under utvikling) -- løst med kant-til-kant-beskjæring til et TALLERE
    // bånd (~720px), pluss en myk fargeglød bak teksten (samme visuelle
    // grep som gløden bak Spir på forsiden) for å unngå et flatt, livløst
    // tomrom.
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
