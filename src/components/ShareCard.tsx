"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { FactorHeroContent, COLORS, VIEWBOX_WIDTH, VIEWBOX_HEIGHT } from "@/components/FactorHero";
import type { FactorResult, FacetResult } from "@/lib/scoring";
import { bandFor, INTERPRETATIONS, pickDominantFactor } from "@/data/interpretations";
import { pickMemeCards, pickDomainMemeCard, memeCardThumbSrc, type MemeCardAsset } from "@/data/memeCards";
import {
  SHARE_FORMATS,
  GENERIC_SHARE_TEXT,
  svgElementToPngBlob,
  downloadBlob,
  shareImageFile,
  type ShareFormat,
} from "@/lib/shareCard";
import { buttonClassNames } from "@/components/ui/Button";
import { useFlags } from "@/components/FlagsProvider";
import { trackEvent } from "@/lib/metrics/client";

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

/**
 * v2.42 (Kvalitetsrevisjon 31.07.2026, kap. 1, middels alvorlighet): de tre
 * `role="radio"`-gruppene i denne filen (formatvelgeren her og i
 * DomainShareCard, samt kort-velgeren under) hadde ARIA-radiosemantikk uten
 * det tastaturmønsteret ARIA krever -- skjermleserbrukere fikk annonsert
 * "radio", men gruppen oppførte seg som separate knapper (hver med eget
 * tab-stopp, ingen piltast-navigasjon). Denne hooken gir ekte "roving
 * tabindex"-oppførsel: kun det valgte alternativet er et tab-stopp
 * (tabIndex 0), resten er tabIndex -1, og piltaster/Home/End flytter BÅDE
 * valg og fokus innad i gruppen -- standardmønsteret for
 * `role="radiogroup"` (WAI-ARIA Authoring Practices). Holdt som én delt hook
 * fremfor tre kopier, siden alle tre gruppene trenger nøyaktig samme atferd.
 */
function useRovingRadioGroup<T extends string>(keys: readonly T[], selected: T, onSelect: (key: T) => void) {
  const buttonRefs = useRef<Partial<Record<T, HTMLButtonElement | null>>>({});

  function registerRef(key: T) {
    return (el: HTMLButtonElement | null) => {
      buttonRefs.current[key] = el;
    };
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = keys.indexOf(selected);
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = (currentIndex + 1) % keys.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIndex = (currentIndex - 1 + keys.length) % keys.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = keys.length - 1;
    if (nextIndex === null) return;
    e.preventDefault();
    const nextKey = keys[nextIndex]!;
    onSelect(nextKey);
    buttonRefs.current[nextKey]?.focus();
  }

  return { registerRef, onKeyDown };
}

function MemeShareCard({ items, onArtMissing }: { items: MemeShareItem[]; onArtMissing: () => void }) {
  const [selectedKey, setSelectedKey] = useState(items[0]!.key);
  const { sharingEnabled } = useFlags();
  const [format, setFormat] = useState<ShareFormat>("story");
  const [busy, setBusy] = useState<"share" | "download" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selected = items.find((c) => c.key === selectedKey) ?? items[0]!;
  const spec = SHARE_FORMATS[format];
  const imgSrc = format === "square" ? selected.asset.square : selected.asset.story;
  // v2.44 (Kvalitetsrevisjon 31.07.2026, kap. 4): meme-kortene er nå WebP,
  // ikke PNG (se memeCards.ts) -- `spec.filename` er delt med det
  // SVG-genererte fallback-kortet (som fortsatt er ekte PNG), så vi retter
  // filendelsen her i stedet for å gjøre spec-en selv formatbevisst.
  const downloadFilename = spec.filename.replace(/\.png$/, ".webp");

  const formatGroup = useRovingRadioGroup(FORMAT_ORDER, format, setFormat);
  const itemKeys = useMemo(() => items.map((c) => c.key), [items]);
  const itemGroup = useRovingRadioGroup(itemKeys, selectedKey, setSelectedKey);

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

  /**
   * Delingen er avskrudd under beta, men knappene står fortsatt der og er
   * klikkbare -- med vilje. Hvert forsøk telles som `share_attempted`, og
   * det tallet er hele grunnen til at seksjonen ikke bare er skjult: er det
   * null når betaen er over, vet du at kortene ikke er verdt mer arbeid.
   * Returnerer true når kallet ble stoppet her.
   */
  function blockedByBeta(): boolean {
    if (sharingEnabled) return false;
    trackEvent("share_attempted");
    setFeedback(SHARING_OFF_MESSAGE);
    return true;
  }

  async function handleShare() {
    if (blockedByBeta()) return;
    setBusy("share");
    setFeedback(null);
    const blob = await fetchCurrentAsBlob();
    if (!blob) {
      setBusy(null);
      return;
    }
    trackEvent("share_attempted");
    const shared = await shareImageFile(blob, downloadFilename, GENERIC_SHARE_TEXT);
    if (!shared) {
      downloadBlob(blob, downloadFilename);
      setFeedback("Bildet ble lastet ned i stedet -- del det manuelt fra nedlastingene dine.");
    }
    setBusy(null);
  }

  async function handleDownload() {
    if (blockedByBeta()) return;
    setBusy("download");
    setFeedback(null);
    const blob = await fetchCurrentAsBlob();
    if (blob) {
      trackEvent("share_attempted");
      downloadBlob(blob, downloadFilename);
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
              ref={formatGroup.registerRef(key)}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setFormat(key)}
              onKeyDown={formatGroup.onKeyDown}
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
          // v2.44 (Kvalitetsrevisjon 31.07.2026, kap. 4 funn 1 / kap. 6 funn
          // 1-2): kandidatvelgeren viste tidligere full 1080px-oppløsning
          // (opptil ~3 MB per bilde, tre samtidig) selv om den her vises i en
          // liten kolonne -- et vesentlig, unødvendig mobildata-forbruk.
          // Bruker nå en egen, mye mindre "thumb"-variant (480px bredde, se
          // memeCardThumbSrc/filhode i memeCards.ts). Selve del-/nedlastings-
          // bildet (fetchCurrentAsBlob over) bruker fortsatt full oppløsning
          // -- kun DENNE forhåndsvisningen er nedskalert. `width`/`height`
          // er satt eksplisitt (thumbens faktiske intrinsic-mål) for å unngå
          // layout-hopp (CLS) idet bildet lastes inn.
          const thumbSrc = memeCardThumbSrc(src);
          const thumbWidth = 480;
          const thumbHeight = format === "square" ? 480 : 853;
          return (
            <button
              key={c.key}
              ref={itemGroup.registerRef(c.key)}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelectedKey(c.key)}
              onKeyDown={itemGroup.onKeyDown}
              className={`flex flex-col gap-2 rounded-xl p-1 text-left transition-shadow ${
                items.length > 1 ? "sm:w-1/3" : "sm:max-w-xs"
              } ${
                active
                  ? "ring-2 ring-holo-sky ring-offset-2 ring-offset-lavender-100 dark:ring-offset-transparent"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <span className="overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element -- se under.

                    HVORFOR IKKE next/image HER (v2.50, kvalitetsrevisjon
                    31.07.2026 kveld, funn 4.2 -- vurdert og bevisst avvist):

                    Revisjonen pekte på at next/image ikke brukes noe sted i
                    kodebasen. Gjennomgangen viste at dette er det ENESTE
                    <img>-elementet som finnes: alle andre illustrasjoner
                    (FactorHero, FactorIcon, SpirMascot) er innebygd SVG, som
                    next/image verken kan eller bør røre.

                    Og akkurat dette bildet skal heller ikke over: det er et
                    ferdig komponert delekort som tegnes videre inn i et
                    <canvas> for å lage den nedlastbare filen. next/image
                    leverer et <img> med srcset og en Next-intern URL, og da
                    ville canvas fått en annen oppløsning enn den kortet er
                    tegnet for -- eller blitt "tainted" og nektet eksport.

                    Bildene er dessuten allerede WebP og under 260 KB (de var
                    64 MB PNG fram til v2.46), og har width/height,
                    loading="lazy" og decoding="async" satt for hånd under --
                    altså det next/image ville gitt oss, uten ulempene.

                    Konklusjon: funnet er lukket ved at det ikke finnes noe
                    riktig sted å bruke next/image, ikke ved at det er gjort. */}
                <img
                  src={thumbSrc}
                  alt={`Delbart kort: ${c.asset.quote}`}
                  className="block h-auto w-full"
                  width={thumbWidth}
                  height={thumbHeight}
                  loading="lazy"
                  decoding="async"
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
            className={buttonClassNames("primary", "sm")}
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

/**
 * Meldingen som vises i stedet for å dele, mens sharingEnabled er av.
 * Se SHARING_ENABLED i featureFlags.ts for hvorfor: kortene har
 * dinefasetter.no malt inn i footeren, og det domenet er ikke registrert
 * ennå -- en delt kort ville sendt nysgjerrige til en død adresse.
 */
const SHARING_OFF_MESSAGE =
  "Deling åpnes når testen lanseres for alvor -- den er avskrudd mens vi betatester. Takk for at du ville dele!";

// ---------- v2.37: fallback -- SVG-generert domenekort (ingen meme-kort tilgjengelig ennå) ----------

function DomainShareCard({ factors }: { factors: FactorResult[] }) {
  const dominant = useMemo(() => pickDominantFactor(factors), [factors]);
  const band = bandFor(dominant.score);
  const tagline = INTERPRETATIONS[dominant.factor][band].shareTagline;

  // v2.43 (Kvalitetsrevisjon 31.07.2026, kap. 2, lav alvorlighet): var "square"
  // her, mens MemeShareCard over bruker "story" som standard -- en liten,
  // meningsløs inkonsistens mellom de to variantene av samme funksjon.
  // Unifisert til "story" begge steder (produkteiers begrunnelse for at
  // story skal være standard, se FORMAT_ORDER-kommentaren over).
  const { sharingEnabled } = useFlags();
  const [format, setFormat] = useState<ShareFormat>("story");
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
  const formatKeys = Object.keys(SHARE_FORMATS) as ShareFormat[];
  const formatGroup = useRovingRadioGroup(formatKeys, format, setFormat);

  async function renderCurrentToBlob(): Promise<Blob | null> {
    const svg = refs[format].current;
    if (!svg) return null;
    try {
      const fontFaceCss = await loadBricolageFontFaceCss();
      return await svgElementToPngBlob(svg, spec.width, spec.height, fontFaceCss);
    } catch {
      setFeedback("Klarte ikke å lage bildet akkurat nå -- prøv igjen.");
      return null;
    }
  }

  /** Samme betasperre som i hovedkortet over -- se kommentaren der. */
  function blockedByBeta(): boolean {
    if (sharingEnabled) return false;
    trackEvent("share_attempted");
    setFeedback(SHARING_OFF_MESSAGE);
    return true;
  }

  async function handleShare() {
    if (blockedByBeta()) return;
    setBusy("share");
    setFeedback(null);
    const blob = await renderCurrentToBlob();
    if (!blob) {
      setBusy(null);
      return;
    }
    trackEvent("share_attempted");
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
    if (blockedByBeta()) return;
    setBusy("download");
    setFeedback(null);
    const blob = await renderCurrentToBlob();
    if (blob) {
      trackEvent("share_attempted");
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
        {formatKeys.map((key) => {
          const active = format === key;
          return (
            <button
              key={key}
              ref={formatGroup.registerRef(key)}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setFormat(key)}
              onKeyDown={formatGroup.onKeyDown}
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
            className={buttonClassNames("primary", "sm")}
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

// ---------- v2.43 (Kvalitetsrevisjon 31.07.2026, kap. 3, funn #1): merkevarefont ----------

/**
 * Bygger en selvbærende `@font-face`-CSS-blokk for Bricolage Grotesque
 * (base64-embeddet, se lib/fonts/bricolageGrotesque.ts), til bruk i
 * `svgElementToPngBlob` sitt `fontFaceCss`-parameter. Dynamisk import --
 * de to base64-strengene (~240 KB til sammen) skal kun lastes idet
 * brukeren faktisk trykker "Del bildet"/"Last ned bildet", ikke for alle
 * besøkende som ser resultatsiden (samme prinsipp som jsPDF sin egen
 * dynamiske import).
 */
let cachedBricolageFontFaceCss: string | null = null;
async function loadBricolageFontFaceCss(): Promise<string> {
  if (cachedBricolageFontFaceCss) return cachedBricolageFontFaceCss;
  const { BRICOLAGE_BOLD_BASE64, BRICOLAGE_REGULAR_BASE64 } = await import("@/lib/fonts/bricolageGrotesque");
  cachedBricolageFontFaceCss = `
    @font-face {
      font-family: 'Bricolage Grotesque';
      font-weight: 700;
      src: url(data:font/ttf;base64,${BRICOLAGE_BOLD_BASE64}) format('truetype');
    }
    @font-face {
      font-family: 'Bricolage Grotesque';
      font-weight: 400;
      src: url(data:font/ttf;base64,${BRICOLAGE_REGULAR_BASE64}) format('truetype');
    }
  `;
  return cachedBricolageFontFaceCss;
}

const SHARE_CARD_FONT_STACK = "'Bricolage Grotesque', Arial, sans-serif";

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
/**
 * Felles bunntekst (ordmerke + domene + disclaimer) -- identisk plassering
 * (i px fra bunnen) på begge formater.
 *
 * v2.46 (Kvalitetsrevisjon 31.07.2026, kap. 11, funn #1 -- middels): dette
 * SVG-genererte fallback-kortet manglet domenet -- de ferdigproduserte
 * meme-kortene (memeCards.ts) har allerede en "dinefasetter.no"-footer
 * påmalt i selve bildet fra produksjonen, så dette bringer fallback-kortet
 * på linje med dem. "dinefasetter.no" er bevisst skrevet ut som REN TEKST
 * (ikke en klikkbar lenke -- SVG/PNG-bilder har ingen lenker uansett), på
 * samme måte som teksten allerede brukes i lib/pdfReport.ts sin
 * avslutningstekst -- domenet er ikke registrert/live ennå, men det er
 * likevel produkteiers etablerte praksis å nevne det som fremtidig
 * merkevarenavn i delt/eksportert innhold, jf. de nevnte stedene.
 */
function CardFooter({ width, totalHeight, color }: { width: number; totalHeight: number; color: string }) {
  return (
    <>
      <text
        x={width / 2}
        y={totalHeight - 48}
        textAnchor="middle"
        fontFamily={SHARE_CARD_FONT_STACK}
        fontSize={26}
        fill={color}
        opacity={0.6}
      >
        Dine Fasetter -- en norsk personlighetstest · dinefasetter.no
      </text>
      <text
        x={width / 2}
        y={totalHeight - 18}
        textAnchor="middle"
        fontFamily={SHARE_CARD_FONT_STACK}
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
        <text x={540} y={motifHeight + 280} textAnchor="middle" fontFamily={SHARE_CARD_FONT_STACK} fontWeight={700} fontSize={68} fill="white">
          {label}
        </text>
        <text x={540} y={motifHeight + 356} textAnchor="middle" fontFamily={SHARE_CARD_FONT_STACK} fontSize={42} fill={COLORS.lavender100}>
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
      <text x={540} y={motifHeight + 275} textAnchor="middle" fontFamily={SHARE_CARD_FONT_STACK} fontWeight={700} fontSize={60} fill="white">
        {label}
      </text>
      <text x={540} y={motifHeight + 339} textAnchor="middle" fontFamily={SHARE_CARD_FONT_STACK} fontSize={36} fill={COLORS.lavender100}>
        {tagline}
      </text>
      <CardFooter width={1080} totalHeight={1080} color={COLORS.lavender100} />
    </>
  );
}

export default ShareCard;
