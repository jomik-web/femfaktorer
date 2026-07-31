import { jsPDF, GState } from "jspdf";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Domain } from "@/data/questions";
import type { DisplayFactor, FactorResult, FacetResult, ResultTier } from "@/lib/scoring";
import { DOMAIN_TO_DISPLAY } from "@/lib/scoring";
import { INTERPRETATIONS, DOMAIN_DEFINITIONS, NON_DIAGNOSTIC_NOTICE, CRISIS_NOTICE, bandFor } from "@/data/interpretations";
import { FACET_INTERPRETATIONS, FACET_ORDER_BY_DOMAIN, facetInterpretationFor } from "@/data/facetInterpretations";
import { zoneIndexFor, zoneLabelFor } from "@/components/RoughFactorIndicator";
import { FactorHeroContent, VIEWBOX_WIDTH as HERO_VIEWBOX_WIDTH, VIEWBOX_HEIGHT as HERO_VIEWBOX_HEIGHT } from "@/components/FactorHero";

/**
 * v2.37 (produkteiers ønske 26.07.2026, kvalitetssammenligning mot en
 * konkurrent-PDF): reverserer DOMAIN_TO_DISPLAY (samme mønster som
 * DISPLAY_TO_DOMAIN i resultat/page.tsx) -- trengs for å finne underkategori-
 * ene som hører til EN gitt hovedkategori, se fiksen lenger ned.
 */
const DISPLAY_TO_DOMAIN: Record<DisplayFactor, Domain> = Object.fromEntries(
  (Object.entries(DOMAIN_TO_DISPLAY) as [Domain, DisplayFactor][]).map(([domain, display]) => [display, domain])
) as Record<DisplayFactor, Domain>;

/**
 * Ekte PDF-eksport av resultatet (v2.28, 23.07.2026) -- erstatter den
 * gamle "Last ned som PDF"-knappen, som kalte window.print() og lente seg
 * på at nettleseren/OS-et hadde en "Skriv ut -> Lagre som PDF"-mulighet.
 * På mobil (spesielt iPhone uten en synlig PDF-skriver i utskriftsdialogen)
 * fungerte dette ikke i praksis -- brukeren ble bare sendt til en vanlig
 * utskriftsdialog uten noen måte å faktisk få en PDF-fil.
 *
 * Denne modulen bygger PDF-en direkte i nettleseren med jsPDF (ren
 * tekst/rektangel-tegning -- IKKE et skjermbilde av selve siden), og
 * tilbyr den til brukeren på to måter:
 *  - Vanlig nedlasting (doc.save()) -- fungerer overalt på desktop, og på
 *    Android/andre mobiler som støtter <a download> for blob-URL-er.
 *  - Web Share API (samme mønster som CSV-eksporten i
 *    AnswerSetCsvPanel.tsx) på ekte iPhone/iPad -- gir et ordentlig
 *    "Lagre til Filer"/del-ark, som er den pålitelige måten å faktisk få
 *    en lagret PDF-fil på iOS (Safari støtter ikke <a download> for
 *    blob-URL-er pålitelig).
 *
 * MERK: "jspdf" er en ny avhengighet (package.json) -- sandkassen som ble
 * brukt til å utvikle dette har ikke nettverkstilgang til npm-registeret,
 * så `npm install` må kjøres lokalt før dette kompilerer og kjører.
 */

const FACTOR_RGB: Record<DisplayFactor, [number, number, number]> = {
  openness: [139, 124, 232],
  conscientiousness: [65, 115, 230],
  extraversion: [255, 112, 51],
  agreeableness: [81, 214, 99],
  stability: [255, 107, 138],
};

const INDIGO_RGB: [number, number, number] = [20, 20, 43];
const GRAY_RGB: [number, number, number] = [110, 108, 120];
const TRACK_RGB: [number, number, number] = [233, 229, 245];

/**
 * v2.39 (produkteiers ønske 28.07.2026): Spir-illustrasjon på avslutningssiden
 * -- statisk SVG-markup som gjenskaper "oppmuntrende"-uttrykket til
 * SpirMascot.tsx (samme koordinater, farger og gradient-stopp, se der for
 * "master reference"-kommentarene). Duplisert som en ren streng her, IKKE
 * gjenbrukt via React/renderToStaticMarkup, fordi jsPDF trenger et
 * rasterbilde (PNG/JPEG) -- SVG-en konverteres til en data-URL via
 * canvas i `loadSpirMascotDataUrl` under, som kun kan kjøre i nettleseren
 * (samme forutsetning som resten av denne modulen).
 */
const SPIR_MASCOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="spirBodyPdf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5FF0C0" />
      <stop offset="50%" stop-color="#5FC0F0" />
      <stop offset="100%" stop-color="#C05FF0" />
    </linearGradient>
    <linearGradient id="spirGoldPdf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE07A" />
      <stop offset="100%" stop-color="#E0A93A" />
    </linearGradient>
    <linearGradient id="spirLensPdf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1A2E" />
      <stop offset="100%" stop-color="#3A3A5E" />
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="184" rx="42" ry="7" fill="#E9E5F5" opacity="0.7" />
  <path d="M56,132 Q30,138 34,160" stroke="#5FC0F0" stroke-width="12" fill="none" stroke-linecap="round" />
  <circle cx="34" cy="160" r="9" fill="#5FC0F0" />
  <path d="M96,58 C126,54 150,74 150,104 C150,134 148,166 108,178 C84,184 58,172 50,146 C42,118 50,84 74,64 C81,59 88,58 96,58 Z" fill="url(#spirBodyPdf)" />
  <ellipse cx="78" cy="90" rx="16" ry="19" fill="#AEE8F5" />
  <path d="M74,140 Q96,156 118,140" stroke="url(#spirGoldPdf)" stroke-width="2" fill="none" stroke-linecap="round" />
  <circle cx="96" cy="157" r="3.2" fill="url(#spirGoldPdf)" />
  <ellipse cx="77" cy="100" rx="16" ry="11" fill="url(#spirLensPdf)" />
  <ellipse cx="116" cy="97" rx="16" ry="11" fill="url(#spirLensPdf)" />
  <rect x="92" y="96" width="8" height="3.5" fill="#1A1A2E" />
  <ellipse cx="109" cy="93" rx="3.5" ry="2" fill="white" opacity="0.6" />
  <path d="M66,82 Q77,77 88,82" stroke="#14142B" stroke-width="3" fill="none" stroke-linecap="round" />
  <path d="M104,82 Q116,77 128,82" stroke="#14142B" stroke-width="3" fill="none" stroke-linecap="round" />
  <path d="M85,122 Q97,131 111,120" stroke="#14142B" stroke-width="3.2" fill="none" stroke-linecap="round" />
  <path d="M97,124 L98.5,128.5 L101,123.5 Z" fill="white" />
  <circle cx="63" cy="113" r="6" fill="#FFE07A" opacity="0.6" />
  <circle cx="129" cy="113" r="6" fill="#FFE07A" opacity="0.6" />
</svg>`;

/**
 * Rasteriserer `SPIR_MASCOT_SVG` til en PNG-data-URL via en usynlig
 * canvas -- eneste måten jsPDF (som kun tegner rektangler/linjer/tekst
 * eller ferdige rasterbilder, ikke SVG-baner) kan vise illustrasjonen på.
 * Returnerer `null` ved feil (f.eks. i et miljø uten Image/canvas) -- da
 * hoppes bildet bare over, resten av rapporten genereres uansett.
 */
/**
 * v2.40 (produkteiers ønske 28.07.2026): felles rasteriserings-hjelper --
 * trukket ut av det som opprinnelig kun var Spir-illustrasjonens egen
 * funksjon, slik at domene-motivene (se `loadFactorHeroDataUrl` under) kan
 * gjenbruke samme canvas-omvei i stedet for å duplisere den.
 */
async function rasterizeSvgToPngDataUrl(svgMarkup: string, widthPx: number, heightPx: number): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  try {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Kunne ikke laste illustrasjonen."));
        image.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = widthPx;
      canvas.height = heightPx;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, widthPx, heightPx);
      return canvas.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null;
  }
}

async function loadSpirMascotDataUrl(): Promise<string | null> {
  return rasterizeSvgToPngDataUrl(SPIR_MASCOT_SVG, 800, 800);
}

/**
 * v2.40 (produkteiers ønske 28.07.2026, presisert etter oppklaring: motivene
 * skal knyttes til de 5 HOVEDKATEGORIENE, ikke underkategoriene): de samme
 * hånd-tegnede landskapsmotivene som allerede står øverst på hver
 * hovedkategori-seksjon PÅ NETTSIDEN (FactorHero.tsx, "store motiv"-serien)
 * fantes ikke i PDF-en i det hele tatt -- lagt til her.
 *
 * Gjenbruker `FactorHeroContent` (den indre scenen+masken, UTEN den ytre
 * `<svg>`) direkte -- IKKE duplisert som en statisk streng slik Spir-
 * mascoten måtte gjøres, siden dette er ren, hook-fri JSX som kan
 * serialiseres trygt med `renderToStaticMarkup` (samme teknikk som
 * ShareCard.tsx allerede bruker til å gjenbruke NØYAKTIG samme scene i
 * delekortene, se dens filhode). Wrapper selv resultatet i en minimal
 * `<svg>` med eksplisitt `xmlns` (React sin JSX-utgave mangler dette
 * attributtet, som kreves for at en frittstående SVG-streng skal rendres
 * riktig utenfor en HTML-dokumentkontekst).
 */
async function loadFactorHeroDataUrl(factor: DisplayFactor): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const content = createElement(FactorHeroContent, { factor, uid: `pdf-${factor}` });
    const svgRoot = createElement(
      "svg",
      { xmlns: "http://www.w3.org/2000/svg", viewBox: `0 0 ${HERO_VIEWBOX_WIDTH} ${HERO_VIEWBOX_HEIGHT}` },
      content
    );
    const markup = renderToStaticMarkup(svgRoot);
    const widthPx = 1400;
    const heightPx = Math.round((widthPx * HERO_VIEWBOX_HEIGHT) / HERO_VIEWBOX_WIDTH);
    return await rasterizeSvgToPngDataUrl(markup, widthPx, heightPx);
  } catch {
    return null;
  }
}

export interface ResultPdfInput {
  factors: FactorResult[];
  facets: FacetResult[];
  tier: ResultTier;
  /** Avsluttende profiloppsummering ("Hva betyr dette for deg?"), om noen. */
  closingText?: string | null;
}

/**
 * Sant KUN på ekte iPhone/iPad -- se identisk sjekk (med forklaring) i
 * AnswerSetCsvPanel.tsx.
 */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPod|iPad/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

const MARGIN = 18;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/**
 * Registrerer Bricolage Grotesque i jsPDF (v2.43, Kvalitetsrevisjon
 * 31.07.2026, kap. 3, funn #1) -- PDF-en brukte tidligere kun jsPDF sin
 * innebygde Helvetica overalt, ikke merkevarefontene. Produkteier har sendt
 * Bricolage Grotesque (ikke Inter ennå) -- brukt til overskrifter, tall og
 * annen uthevet ("bold") tekst, altså akkurat den bruken Designsystem v2.0
 * selv definerer for denne fonten (se layout.tsx). Brødtekst
 * (`paragraph()`-hjelperen) står fortsatt i Helvetica inntil en Inter-fil
 * eventuelt ettersendes -- Bricolage er en bevisst "håndsatt"/grotesk
 * display-font, ikke tiltenkt lange leseflater.
 *
 * Dynamisk import av base64-dataene (~240 KB) -- lastes kun når brukeren
 * faktisk trykker "Last ned som PDF", ikke i den vanlige sidebunten.
 */
async function registerBricolageFont(doc: jsPDF): Promise<void> {
  const { BRICOLAGE_BOLD_BASE64, BRICOLAGE_REGULAR_BASE64 } = await import("@/lib/fonts/bricolageGrotesque");
  doc.addFileToVFS("BricolageGrotesque-Bold.ttf", BRICOLAGE_BOLD_BASE64);
  doc.addFont("BricolageGrotesque-Bold.ttf", "BricolageGrotesque", "bold");
  doc.addFileToVFS("BricolageGrotesque-Regular.ttf", BRICOLAGE_REGULAR_BASE64);
  doc.addFont("BricolageGrotesque-Regular.ttf", "BricolageGrotesque", "normal");
}

async function buildDoc(input: ResultPdfInput): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  await registerBricolageFont(doc);
  let y = MARGIN;

  function ensureSpace(needed: number) {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function heading(text: string, size: number) {
    ensureSpace(size * 0.5 + 4);
    doc.setTextColor(...INDIGO_RGB);
    doc.setFont("BricolageGrotesque", "bold");
    doc.setFontSize(size);
    doc.text(text, MARGIN, y);
    y += size * 0.5 + 2;
  }

  function paragraph(text: string, size = 10, color: [number, number, number] = INDIGO_RGB) {
    if (!text) return;
    doc.setTextColor(...color);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH) as string[];
    for (const line of lines) {
      ensureSpace(5.5);
      doc.text(line, MARGIN, y);
      y += 5;
    }
    y += 2;
  }

  // v2.39: brukes nå KUN for hoveddomene-skårer -- underkategoriene fikk sin
  // egen `zoneBar` under (5 grove soner, ikke en kontinuerlig stolpe), se
  // begrunnelsen der. `thin`-varianten som fantes her tidligere er fjernet
  // sammen med det.
  function scoreBar(score: number, color: [number, number, number]) {
    const height = 3.2;
    ensureSpace(height + 2.8);
    const clamped = Math.min(100, Math.max(0, score));
    doc.setFillColor(...TRACK_RGB);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, height, height / 2, height / 2, "F");
    if (clamped > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(MARGIN, y, (CONTENT_WIDTH * clamped) / 100, height, height / 2, height / 2, "F");
    }
    y += 7;
  }

  /**
   * v2.39 (produkteiers ønske 28.07.2026): erstatter den kontinuerlige
   * stolpen + eksakte tallet ("92/100") som tidligere ble vist per
   * underkategori. En underkategori bygger på bare 4-5 spørsmål og har intet
   * reelt normgrunnlag ennå (ren lineær skalering, se lib/scoring.ts sitt
   * filhode) -- akkurat den begrunnelsen fikk RoughFactorIndicator til å
   * ERSTATTE eksakte tall med 5 grove soner OVERALT på nettsiden (se
   * komponentens egen doc-kommentar). PDF-en viste likevel eksakte
   * fasett-tall, i strid med det prinsippet -- denne funksjonen gjenbruker nå
   * samme sone-logikk (zoneIndexFor/zoneLabelFor, eksportert derfra) slik at
   * PDF og nettside sier det samme om hvor presist en fasettskår faktisk er.
   */
  function zoneBar(score: number, color: [number, number, number]) {
    const zoneIndex = zoneIndexFor(score);
    const height = 2.6;
    const gap = 1.2;
    const segWidth = (CONTENT_WIDTH - gap * 4) / 5;
    ensureSpace(height + 3);
    for (let i = 0; i < 5; i++) {
      const x = MARGIN + i * (segWidth + gap);
      doc.setFillColor(...(i === zoneIndex ? color : TRACK_RGB));
      doc.roundedRect(x, y, segWidth, height, height / 2, height / 2, "F");
    }
    y += height + 3;
  }

  /**
   * v2.37: kompakt pentagon-/radardiagram over de fem hovedfaktorene --
   * lagt til etter kvalitetssammenligningen mot en konkurrent-PDF (som IKKE
   * hadde noen diagrammer -- den er typebasert, ikke skårbasert). Dette er
   * nettopp den typen visualisering en konkurrent uten skårdata ikke kan
   * tilby, og spiller derfor på det Dine Fasetter faktisk er god på
   * (presise tall), i stedet for å kopiere en ren tekst-stil. Tegnet med
   * jsPDF sine vektor-primitiver (rene linjer/polygoner), ikke et bilde.
   */
  function drawFactorRadar(factors: FactorResult[]) {
    // v2.39 (produkteiers ønske 28.07.2026): forstørret fra 26 -- illustrasjonen
    // skal "gjøres stor" og gis mer luft rundt seg, se kallstedet under.
    const maxRadius = 34;
    const chartHeight = maxRadius * 2 + 22;
    ensureSpace(chartHeight);
    const cx = MARGIN + CONTENT_WIDTH / 2;
    const topY = y;
    const cy = topY + maxRadius + 6;
    const count = factors.length;

    const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / count;
    const vertex = (radius: number, i: number): [number, number] => {
      const angle = angleFor(i);
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    };
    const drawClosedPath = (points: [number, number][], style: string) => {
      const start = points[0];
      if (!start) return;
      const deltas = points.slice(1).map((p, idx) => {
        const prev = points[idx]!;
        return [p[0] - prev[0], p[1] - prev[1]];
      });
      doc.lines(deltas, start[0], start[1], [1, 1], style, true);
    };

    // Referanseringer (25/50/75/100 %) -- rent visuelt rutenett.
    doc.setDrawColor(...TRACK_RGB);
    doc.setLineWidth(0.25);
    for (const frac of [0.25, 0.5, 0.75, 1]) {
      drawClosedPath(
        factors.map((_, i) => vertex(maxRadius * frac, i)),
        "S"
      );
    }

    // Akselinjer fra midtpunktet ut til hvert hjørne.
    factors.forEach((_, i) => {
      const [vx, vy] = vertex(maxRadius, i);
      doc.line(cx, cy, vx, vy);
    });

    // Selve datapolygonet -- lett gjennomsiktig fyll + solid kontur i indigo.
    const dataPoints = factors.map((f, i) => vertex((maxRadius * Math.min(100, Math.max(0, f.score))) / 100, i));
    doc.saveGraphicsState();
    doc.setGState(new GState({ opacity: 0.18 }));
    doc.setFillColor(...INDIGO_RGB);
    drawClosedPath(dataPoints, "F");
    doc.restoreGraphicsState();
    doc.setDrawColor(...INDIGO_RGB);
    doc.setLineWidth(0.6);
    drawClosedPath(dataPoints, "S");

    // Fargede punkter per faktor, pluss etiketter og tall utenfor ringen.
    factors.forEach((f, i) => {
      const [vx, vy] = vertex((maxRadius * Math.min(100, Math.max(0, f.score))) / 100, i);
      doc.setFillColor(...FACTOR_RGB[f.factor]);
      doc.circle(vx, vy, 1.3, "F");

      const [lx, ly] = vertex(maxRadius + 10, i);
      const align: "left" | "center" | "right" = lx < cx - 2 ? "right" : lx > cx + 2 ? "left" : "center";
      doc.setFont("BricolageGrotesque", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...INDIGO_RGB);
      doc.text(f.label, lx, ly, { align });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY_RGB);
      doc.text(`${Math.round(f.score)}/100`, lx, ly + 4, { align });
    });

    y = topY + chartHeight;
  }

  // ---------- Forside ----------
  // v2.37 (kvalitetssammenligning mot en konkurrent-PDF, 26.07.2026): den
  // hadde forside, innholdsoversikt og avslutning -- denne rapporten hoppet
  // rett til innholdet uten noen av delene. Fargestripen bruker de samme
  // fem faktorfargene som stolpene ellers i rapporten -- en visuell
  // "signatur" som faktisk er egen for Dine Fasetter (data-drevet), i
  // stedet for å prøve å kopiere en illustrert forside vi ikke har
  // designressurser til å lage skikkelig.
  const tierLabel =
    input.tier === "extended" ? "Utvidet versjon (290 spørsmål)" : input.tier === "full" ? "Fullversjon (120 spørsmål)" : "Foreløpig resultat (50 spørsmål)";
  const generatedDate = new Date().toLocaleDateString("no-NO");

  const stripeColors = Object.values(FACTOR_RGB);
  const stripeWidth = PAGE_WIDTH / stripeColors.length;
  stripeColors.forEach((color, i) => {
    doc.setFillColor(...color);
    doc.rect(i * stripeWidth, 0, stripeWidth + 0.5, 12, "F");
  });

  doc.setTextColor(...GRAY_RGB);
  doc.setFont("BricolageGrotesque", "normal");
  doc.setFontSize(11);
  doc.text("Dine Fasetter", MARGIN, 45);

  doc.setTextColor(...INDIGO_RGB);
  doc.setFont("BricolageGrotesque", "bold");
  doc.setFontSize(30);
  doc.text("Din profil", MARGIN, 60);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...GRAY_RGB);
  doc.text(`${tierLabel} -- generert ${generatedDate}`, MARGIN, 70);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Basert utelukkende på dine egne svar -- ikke en fasit, men et bilde av tendenser nå.", MARGIN, 85);

  // v2.39 (produkteiers ønske 28.07.2026): Spir-illustrasjonen flyttet hit
  // fra avslutningssiden -- stor, sentrert, med god luft ned mot
  // sidekanten (forsiden har ingen bunntekst/footer å ta hensyn til).
  const spirDataUrl = await loadSpirMascotDataUrl();
  if (spirDataUrl) {
    const imgSize = 120;
    const imgX = (PAGE_WIDTH - imgSize) / 2;
    const imgY = 110;
    doc.addImage(spirDataUrl, "PNG", imgX, imgY, imgSize, imgSize);
  }

  doc.addPage();
  y = MARGIN;

  paragraph(NON_DIAGNOSTIC_NOTICE, 8.5, GRAY_RGB);
  paragraph(CRISIS_NOTICE, 8.5, GRAY_RGB);
  y += 4;

  // ---------- De fem hovedfaktorene sett under ett (radardiagram) ----------
  // v2.39 (produkteiers ønske 28.07.2026): overskriften "Profilen din i korte
  // trekk" fortalte ikke hva diagrammet FAKTISK viser -- byttet til en mer
  // presis overskrift, og lagt til to forklarende avsnitt: ett om selve
  // diagrammet, ett om poengsystemet bak tallene (hvordan skåren regnes ut,
  // hva 100/100 betyr, og at det -- viktig, se doc-kommentaren i
  // lib/scoring.ts -- IKKE finnes et normert referanseutvalg ennå, så 50 er
  // midtpunktet på svarskalaen, ikke et fastsatt populasjonsgjennomsnitt).
  ensureSpace(12);
  heading("De fem hovedfaktorene sett under ett", 13);
  paragraph(
    "Diagrammet nedenfor viser skåren din -- fra 0 til 100 -- på alle de fem hovedfaktorene i femfaktormodellen samtidig, i ett og samme bilde. Jo lenger ut mot kanten et punkt ligger, desto høyere skåret du på nettopp den faktoren. Formen som dannes gir et raskt, samlet inntrykk av profilen din, mens hver faktor blir forklart i sin egen fylde på sidene som følger."
  );
  y += 2;
  heading("Om poengsystemet", 11.5);
  paragraph(
    "Skåren for hver faktor bygger på hvor du plasserte deg på en fempunktsskala, fra «helt uenig» til «helt enig», på flere ulike påstander innenfor samme faktor. Svarene dine regnes om til et tall mellom 0 og 100 med en ren, lineær omregning -- ikke en sammenligning med andre som har tatt testen. 50 poeng er derfor midtpunktet på din egen svarskala, ikke et fastsatt gjennomsnitt for befolkningen -- Dine Fasetter har foreløpig ikke et normert referanseutvalg å måle deg opp mot. En skår på 100 av 100 betyr at du svarte i den mest markerte enden av skalaen på samtlige påstander i akkurat den faktoren, ikke at trekket er «maksimalt» i noen absolutt forstand. Skåren kan også variere noe fra gang til gang, siden den bygger på hvordan du kjenner deg selv der og da -- den er ikke ment å være et eksakt eller uforanderlig mål."
  );
  // v2.39: bevisst ekstra luft her (utover det `paragraph()` allerede legger
  // inn) -- produkteiers ønske om et synlig mellomrom mellom forklaringen
  // over og selve illustrasjonen under.
  y += 10;
  drawFactorRadar(input.factors);
  y += 4;

  // ---------- Hovedfaktorer (+ underkategorier gruppert under RIKTIG domene) ----------
  // v2.37: underkategoriene lå tidligere i én flat liste for ALLE domener,
  // samlet etter at samtlige fem hovedkategori-tekstene var skrevet ut --
  // uten domene-overskrifter innimellom, så det kun var selve innholdet som
  // avslørte at det byttet fra f.eks. Medmenneskelighet til Planmessighet.
  // Nettsiden (resultat/page.tsx) viser derimot hver hovedkategoris egne
  // underkategorier RETT UNDER den kategorien -- PDF-en har mistet den
  // grupperingen. Fikset ved å flytte underkategori-visningen inn i samme
  // løkke som hovedkategorien, filtrert på domenet (samme mønster som
  // `facetsForDomain` i resultat/page.tsx).
  // v2.38 (produkteiers ønske 26.07.2026): sideskift FØR hvert domene --
  // konkurrent-PDF-en brukte tydelige kapittelbrudd per trekk, mens denne
  // rapporten tidligere lot domenene flyte etter hverandre på samme side når
  // det var plass. Gir en renere, mer "kapittel per trekk"-følelse ved
  // utskrift/lesing, på bekostning av noe mer papir/sider.
  for (const f of input.factors) {
    doc.addPage();
    y = MARGIN;

    // v2.40: samme motiv som står øverst på denne hovedkategorien på
    // nettsiden -- se `loadFactorHeroDataUrl` sin doc-kommentar.
    const heroDataUrl = await loadFactorHeroDataUrl(f.factor);
    if (heroDataUrl) {
      const heroWidth = CONTENT_WIDTH;
      const heroHeight = (heroWidth * HERO_VIEWBOX_HEIGHT) / HERO_VIEWBOX_WIDTH;
      ensureSpace(heroHeight + 4);
      doc.addImage(heroDataUrl, "PNG", MARGIN, y, heroWidth, heroHeight);
      y += heroHeight + 4;
    }

    heading(f.label, 14);
    paragraph(DOMAIN_DEFINITIONS[f.factor], 8.5, GRAY_RGB);
    doc.setTextColor(...INDIGO_RGB);
    doc.setFont("BricolageGrotesque", "bold");
    doc.setFontSize(10);
    doc.text(`${Math.round(f.score)} / 100`, MARGIN, y);
    y += 5;
    scoreBar(f.score, FACTOR_RGB[f.factor]);

    const band = bandFor(f.score);
    const copy = INTERPRETATIONS[f.factor][band];
    if (copy.synthesis) {
      paragraph(copy.synthesis);
    } else {
      paragraph(copy.overview);
      paragraph(copy.nuance);
    }
    y += 3;

    // v2.38: samme "Balansert / Ubalansert / Bygg videre" + øvelse-seksjon
    // som nettsiden (se GrowthSection i resultat/page.tsx) -- tegnet direkte
    // med jsPDF-primitiver siden JSX ikke kan gjenbrukes her.
    if (copy.growth) {
      ensureSpace(10);
      // v2.41: samme overskrift-endring som nettsiden (se GrowthSection i
      // resultat/page.tsx sin doc-kommentar) -- signaliserer at seksjonen er
      // handlingsrettet, ikke en oppsummering av teksten over.
      heading("Hva kan du gjøre med dette?", 11.5);
      doc.setFont("BricolageGrotesque", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...INDIGO_RGB);
      ensureSpace(6);
      doc.text("Balansert", MARGIN, y);
      y += 5;
      paragraph(copy.growth.balanced, 9.5);
      doc.setFont("BricolageGrotesque", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...INDIGO_RGB);
      ensureSpace(6);
      doc.text("Ubalansert", MARGIN, y);
      y += 5;
      paragraph(copy.growth.unbalanced, 9.5);
      doc.setFont("BricolageGrotesque", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...INDIGO_RGB);
      ensureSpace(6);
      doc.text("Bygg videre", MARGIN, y);
      y += 5;
      paragraph(copy.growth.rebalancing, 9.5);
      doc.setFont("BricolageGrotesque", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...INDIGO_RGB);
      ensureSpace(6);
      doc.text("Prøv denne uken", MARGIN, y);
      y += 5;
      paragraph(copy.growth.exercise, 9.5, GRAY_RGB);
      y += 2;
    }

    if (input.tier !== "free" && input.facets.length > 0) {
      const domain = DISPLAY_TO_DOMAIN[f.factor];
      const order = FACET_ORDER_BY_DOMAIN[domain];
      const facetsForDomain = order
        .map((code) => input.facets.find((fa) => fa.facet === code))
        .filter((fa): fa is FacetResult => fa !== undefined);

      if (facetsForDomain.length > 0) {
        ensureSpace(10);
        heading("Underkategorier", 11.5);
        for (const fa of facetsForDomain) {
          ensureSpace(16);
          const meta = FACET_INTERPRETATIONS[fa.facet];
          const label = meta?.label ?? fa.facet;
          const zoneLabel = zoneLabelFor(label, zoneIndexFor(fa.score));
          doc.setTextColor(...INDIGO_RGB);
          doc.setFont("BricolageGrotesque", "bold");
          doc.setFontSize(10);
          doc.text(label, MARGIN, y);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...GRAY_RGB);
          doc.text(zoneLabel, PAGE_WIDTH - MARGIN, y, { align: "right" });
          y += 4.5;
          zoneBar(fa.score, FACTOR_RGB[f.factor]);
          paragraph(facetInterpretationFor(fa.facet, bandFor(fa.score)), 9);
        }
        y += 3;
      }
    }
  }

  // ---------- Oppsummering ----------
  if (input.closingText) {
    ensureSpace(14);
    heading("Hva betyr dette for deg?", 15);
    paragraph(input.closingText);
  }

  // ---------- Avslutningsside ----------
  // v2.37: rapporten stoppet tidligere brått rett etter oppsummeringen --
  // ingen avsluttende side, i motsetning til konkurrent-PDF-en som ble brukt
  // i sammenligningen (egen "Next steps"-side). Gjentar bevisst IKKE
  // CLOSING_LINE-setningen fra `closingText` ("Ingen deler av profilen din
  // er faste...") her -- den er allerede sagt der, og skal ikke dupliseres.
  doc.addPage();
  y = MARGIN;
  heading("Takk for at du tok deg tid", 16);
  paragraph(
    "Vil du utforske resultatet videre? Spir, vår AI-veileder, kan hjelpe deg å reflektere videre rundt funnene over -- eller ta testen på nytt lenger frem i tid for å se hvordan svarene dine har endret seg. Begge deler finner du på dinefasetter.no."
  );
  y += 4;
  paragraph(
    "Denne rapporten er generert til privat bruk, basert på svarene dine i Dine Fasetter, og bør ikke brukes som en offisiell eller klinisk vurdering av deg selv eller andre.",
    8.5,
    GRAY_RGB
  );

  // ---------- Bunntekst på alle sider unntatt forsiden ----------
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...TRACK_RGB);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 14);
    doc.setTextColor(...GRAY_RGB);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Dine Fasetter", MARGIN, PAGE_HEIGHT - 9);
    doc.text(`Side ${i - 1} av ${totalPages - 1}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 9, { align: "right" });
  }

  return doc;
}

/**
 * Bygger PDF-en og tilbyr den til brukeren -- last ned direkte (desktop/
 * Android) eller via del-arket (ekte iPhone/iPad). Kalles fra en
 * klikk-handler (krever brukerinteraksjon for at navigator.share skal
 * fungere på iOS).
 */
export async function downloadResultPdf(input: ResultPdfInput): Promise<void> {
  const doc = await buildDoc(input);
  const filename = `dine-fasetter-resultat-${new Date().toISOString().slice(0, 10)}.pdf`;

  if (
    isIOS() &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  ) {
    try {
      const blob = doc.output("blob");
      const file = new File([blob], filename, { type: "application/pdf" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (err) {
      // Brukeren avbrøt delingen selv -- ikke fall tilbake til vanlig
      // nedlasting da (den fungerer uansett ikke pålitelig på iOS Safari).
      if (err instanceof Error && err.name === "AbortError") return;
      // Annen, uventet feil -- prøv vanlig nedlasting som fallback under.
    }
  }

  doc.save(filename);
}
