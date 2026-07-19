"use client";

import { useId } from "react";
import type { DisplayFactor } from "@/lib/scoring";

/**
 * FactorHero -- Designsystem v2.0, "store motiv"-serien (godkjent forslag v6,
 * senere justert 19.07.2026: ca. 50% høyere format + dempet bølgeamplitude
 * på Emosjonell stabilitet og Oppsummering).
 *
 * Store landskapsmotiv for hver hovedkategori + oppsummering. Hvert motiv
 * har sin egen "hovedfarge" (faktorfargen) blandet med flere farger fra
 * paletten via graderte himmel-/vann-flater, for å skape bevegelse.
 *
 * Kanten er en uregelmessig, håndtegnet bølge (Catmull-Rom -> Bezier) som
 * følger silhuetten til hovedelementet i hver scene (fjelltopper, fyrtårn,
 * trekroner osv.), i stedet for et rett eller jevnt avrundet rammeverk.
 * Bølgekonturen tones gradvis ut mot gjennomsiktig via en oppmyket maske
 * (feGaussianBlur), slik at motivet glir over i sidens bakgrunnsfarge uten
 * synlig kant. Se 09_Forslag_faktorillustrasjon_v6_bolget.docx for forslaget
 * som ble godkjent.
 *
 * FORMAT: opprinnelig viewBox var 900x260. Motivene er nå tegnet i en
 * 900x390-kanvas (50% høyere) ved å skalere hele scene-innholdet 1,5x
 * vertikalt (<g transform="scale(1,1.5)">) i stedet for å tegne hver scene
 * på nytt -- selve scene-komponentene under er UENDRET 1:1 fra v6-forslaget
 * (900x260-koordinater), kun skalert opp ved rendring. WAVE_PATHS er
 * regnet ut i det ferdig skalerte 900x390-rommet, slik at masken alltid
 * matcher silhuetten uansett skalering.
 */

export type HeroKey = DisplayFactor | "summary";

/** Skala brukt til å gjøre hele motivet ca. 50% høyere (900x260 -> 900x390). */
const HEIGHT_SCALE = 1.5;
const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 260 * HEIGHT_SCALE;

const COLORS = {
  openness: "#8B7CE8",
  conscientiousness: "#4173E6",
  extraversion: "#FF7033",
  agreeableness: "#51D663",
  stability: "#FF6B8A",
  indigo: "#14142B",
  lavender50: "#F6F4FC",
  lavender100: "#E9E5F5",
  holoMint: "#5FF0C0",
  holoSky: "#5FC0F0",
  holoViolet: "#C05FF0",
  goldLight: "#FFE07A",
  goldDefault: "#E0A93A",
  goldDark: "#B9862A",
} as const;

// Håndtegnede bølgekonturer (Catmull-Rom -> kubisk Bezier), forhåndsberegnet
// i det skalerte 900x390-koordinatrommet (se HEIGHT_SCALE over). Emosjonell
// stabilitet og Oppsummering har i tillegg fått bunnradens svingninger
// dempet til ca. halv amplitude (rundt 48 enheter i stedet for 96, i det
// opprinnelige 900x260-rommet) etter tilbakemelding om at bølgen var for
// markant der. Emosjonell stabilitet fikk siden en ekstra runde demping
// spesifikt på midtre fjelltopp (som stakk tydelig mer opp enn de andre
// etter første demping) for å jevne den ut med resten av silhuetten. Se
// prosjektarkivet for punktlistene disse er generert fra.
const WAVE_PATHS: Record<HeroKey, string> = {
  stability:
    "M20,39 C55.0,15.0 151.7,14.5 220,21 C288.3,27.5 353.3,78.5 430,78 C506.7,77.5 605.0,24.5 680,18 C755.0,11.5 845.7,12.0 880,39 C914.3,66.0 883.7,139.0 886,180 C888.3,221.0 898.3,262.3 894,285 C889.7,307.8 877.3,308.5 860,316.5 C842.7,324.5 816.7,332.9 790,333 C763.3,333.1 733.3,317.5 700,317.25 C666.7,317.0 626.7,333.6 590,331.5 C553.3,329.4 508.3,312.9 480,304.5 C451.7,296.1 441.7,279.4 420,281.1 C398.3,282.9 376.7,306.4 350,315 C323.3,323.6 290.0,334.0 260,333 C230.0,332.0 200.0,309.3 170,309 C140.0,308.8 106.0,335.5 80,331.5 C54.0,327.5 25.7,312.8 14,285 C2.3,257.3 9.0,206.0 10,165 C11.0,124.0 -15.0,63.0 20,39 Z",
  openness:
    "M20,36 C68.3,14.0 201.7,13.0 300,18 C398.3,23.0 533.3,65.0 610,66 C686.7,67.0 715.0,28.5 760,24 C805.0,19.5 858.7,15.5 880,39 C901.3,62.5 886.0,124.0 888,165 C890.0,206.0 898.3,257.0 892,285 C885.7,313.0 872.0,320.0 850,333 C828.0,346.0 791.7,367.0 760,363 C728.3,359.0 693.3,310.0 660,309 C626.7,308.0 596.7,356.0 560,357 C523.3,358.0 476.7,313.5 440,315 C403.3,316.5 376.7,363.5 340,366 C303.3,368.5 256.7,330.5 220,330 C183.3,329.5 146.7,364.5 120,363 C93.3,361.5 77.7,336.5 60,321 C42.3,305.5 22.3,298.5 14,270 C5.7,241.5 9.0,189.0 10,150 C11.0,111.0 -28.3,58.0 20,36 Z",
  conscientiousness:
    "M20,36 C61.7,17.0 178.3,24.5 260,21 C341.7,17.5 448.3,16.5 510,15 C571.7,13.5 588.3,9.5 630,12 C671.7,14.5 718.3,25.5 760,30 C801.7,34.5 858.7,19.0 880,39 C901.3,59.0 886.0,119.0 888,150 C890.0,181.0 896.7,191.0 892,225 C887.3,259.0 892.0,329.5 860,354 C828.0,378.5 750.0,373.0 700,372 C650.0,371.0 610.0,348.5 560,348 C510.0,347.5 456.7,369.0 400,369 C343.3,369.0 273.3,348.0 220,348 C166.7,348.0 114.3,389.5 80,369 C45.7,348.5 25.7,264.0 14,225 C2.3,186.0 9.0,166.5 10,135 C11.0,103.5 -21.7,55.0 20,36 Z",
  extraversion:
    "M20,45 C55.0,21.0 148.3,27.5 220,21 C291.7,14.5 373.3,6.0 450,6 C526.7,6.0 608.3,14.5 680,21 C751.7,27.5 845.3,18.5 880,45 C914.7,71.5 886.0,140.0 888,180 C890.0,220.0 898.3,259.5 892,285 C885.7,310.5 875.3,319.0 850,333 C824.7,347.0 778.3,373.0 740,369 C701.7,365.0 666.7,311.0 620,309 C573.3,307.0 506.7,357.5 460,357 C413.3,356.5 380.0,305.5 340,306 C300.0,306.5 256.7,357.5 220,360 C183.3,362.5 145.0,320.0 120,321 C95.0,322.0 87.7,372.0 70,366 C52.3,360.0 24.0,318.5 14,285 C4.0,251.5 9.0,205.0 10,165 C11.0,125.0 -15.0,69.0 20,45 Z",
  agreeableness:
    "M20,39 C58.3,15.5 176.7,29.0 240,24 C303.3,19.0 346.7,10.5 400,9 C453.3,7.5 506.7,11.5 560,15 C613.3,18.5 666.7,25.5 720,30 C773.3,34.5 852.0,17.0 880,42 C908.0,67.0 886.0,138.0 888,180 C890.0,222.0 898.3,266.0 892,294 C885.7,322.0 882.0,335.5 850,348 C818.0,360.5 748.3,369.5 700,369 C651.7,368.5 606.7,345.0 560,345 C513.3,345.0 466.7,369.0 420,369 C373.3,369.0 326.7,345.0 280,345 C233.3,345.0 173.3,368.5 140,369 C106.7,369.5 101.0,360.5 80,348 C59.0,335.5 25.7,324.5 14,294 C2.3,263.5 9.0,207.5 10,165 C11.0,122.5 -18.3,62.5 20,39 Z",
  summary:
    "M20,39 C58.3,17.5 166.7,26.0 240,21 C313.3,16.0 390.0,8.5 460,9 C530.0,9.5 590.0,18.0 660,24 C730.0,30.0 842.0,21.5 880,45 C918.0,68.5 886.0,127.5 888,165 C890.0,202.5 898.3,246.0 892,270 C885.7,294.0 872.0,298.5 850,309 C828.0,319.5 791.7,337.3 760,333 C728.3,328.8 693.3,284.8 660,283.5 C626.7,282.3 598.3,329.3 560,325.5 C521.7,321.8 473.3,261.5 430,261 C386.7,260.5 341.7,316.8 300,322.5 C258.3,328.3 216.7,295.0 180,295.5 C143.3,296.0 107.7,329.8 80,325.5 C52.3,321.3 25.7,299.3 14,270 C2.3,240.8 9.0,188.5 10,150 C11.0,111.5 -18.3,60.5 20,39 Z",
};

// ---------- Scener ----------
// Hver scene gjenskaper geometrien fra det godkjente forslaget 1:1 (farger,
// former, plassering). uid brukes til å lage unike gradient-id-er slik at
// flere instanser på samme side ikke kolliderer.

function StabilityScene({ uid }: { uid: string }) {
  const sky = `sky-${uid}`;
  return (
    <>
      <defs>
        <linearGradient id={sky} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.holoViolet} />
          <stop offset="55%" stopColor={COLORS.holoSky} />
          <stop offset="100%" stopColor={COLORS.lavender100} />
        </linearGradient>
      </defs>
      <rect width={900} height={260} fill={`url(#${sky})`} />
      <circle cx={430} cy={90} r={55} fill={COLORS.goldLight} />
      <path
        d="M60,40 C130,30 180,55 250,42 C300,32 350,50 400,38"
        stroke="white"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M500,60 C560,52 610,68 660,58"
        stroke="white"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M0,220 L100,120 L200,190 L320,90 L440,200 L560,130 L680,210 L800,140 L900,190 L900,260 L0,260 Z"
        fill="#E7A8B8"
      />
      <path
        d="M0,240 L140,150 L260,220 L420,110 L580,230 L740,160 L900,220 L900,260 L0,260 Z"
        fill={COLORS.stability}
      />
      <path d="M420,110 L448,140 L392,140 Z" fill="white" />
    </>
  );
}

function OpennessScene({ uid }: { uid: string }) {
  const sky = `sky-${uid}`;
  return (
    <>
      <defs>
        <linearGradient id={sky} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.holoMint} />
          <stop offset="50%" stopColor={COLORS.holoSky} />
          <stop offset="100%" stopColor={COLORS.holoViolet} />
        </linearGradient>
      </defs>
      <rect width={900} height={260} fill={`url(#${sky})`} />
      <circle cx={760} cy={45} r={3} fill="white" />
      <circle cx={700} cy={30} r={2.5} fill="white" />
      <circle cx={810} cy={60} r={2.5} fill="white" />
      <path
        d="M0,220 L150,130 L320,210 L520,110 L700,200 L900,140 L900,260 L0,260 Z"
        fill="#B9A8E8"
      />
      <path
        d="M0,250 L200,170 L400,240 L620,150 L820,230 L900,190 L900,260 L0,260 Z"
        fill={COLORS.openness}
      />
      <path
        d="M180,255 C210,220 200,195 235,168 C260,148 250,125 280,100"
        stroke={COLORS.goldLight}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="2,12"
      />
      <ellipse cx={620} cy={95} rx={38} ry={46} fill={COLORS.openness} />
      <ellipse cx={608} cy={78} rx={9} ry={12} fill="#D8CFF5" />
      <line x1={600} y1={135} x2={609} y2={162} stroke={COLORS.indigo} strokeWidth={2} />
      <line x1={640} y1={135} x2={631} y2={162} stroke={COLORS.indigo} strokeWidth={2} />
      <rect x={606} y={162} width={26} height={16} rx={3} fill={COLORS.goldDark} />
    </>
  );
}

function ConscientiousnessScene({ uid }: { uid: string }) {
  const sky = `sky-${uid}`;
  const sea = `sea-${uid}`;
  const seaY = 170;
  return (
    <>
      <defs>
        <linearGradient id={sky} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.goldLight} />
          <stop offset="100%" stopColor={COLORS.conscientiousness} />
        </linearGradient>
        <linearGradient id={sea} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.conscientiousness} />
          <stop offset="100%" stopColor={COLORS.holoViolet} />
        </linearGradient>
      </defs>
      <rect width={900} height={seaY} fill={`url(#${sky})`} />
      <rect y={seaY} width={900} height={260 - seaY} fill={`url(#${sea})`} />
      <path d={`M60,${seaY} C70,${seaY - 22} 105,${seaY - 26} 122,${seaY} Z`} fill={COLORS.goldDark} />
      <polygon points="510,40 630,95 510,150" fill={COLORS.goldLight} />
      <path d={`M615,40 L645,40 L655,${seaY} L605,${seaY} Z`} fill={COLORS.lavender100} />
      <rect x={608} y={80} width={44} height={12} fill={COLORS.conscientiousness} />
      <rect x={604} y={118} width={52} height={12} fill={COLORS.conscientiousness} />
      <polygon points="610,40 650,40 630,18" fill={COLORS.conscientiousness} />
      <circle cx={630} cy={30} r={8} fill={COLORS.goldLight} />
      <path
        d={`M760,${seaY + 22} L782,${seaY + 9} L806,${seaY + 22} L802,${seaY + 35} L764,${seaY + 35} Z`}
        fill={COLORS.extraversion}
      />
      <line x1={782} y1={seaY + 9} x2={782} y2={seaY - 14} stroke={COLORS.indigo} strokeWidth={2} />
      <path d={`M774,${seaY - 14} L792,${seaY - 8} L774,${seaY - 2} Z`} fill="white" />
      <line x1={0} y1={seaY + 55} x2={900} y2={seaY + 55} stroke="white" strokeWidth={2} />
    </>
  );
}

function bird(x: number, y: number, s: number, key: string) {
  return (
    <path
      key={key}
      d={`M${x - s},${y} Q${x},${y - s * 0.8} ${x + s},${y} Q${x},${y - s * 0.3} ${x - s},${y}`}
      fill="white"
    />
  );
}

function ExtraversionScene({ uid }: { uid: string }) {
  const sky = `sky-${uid}`;
  const birds: [number, number, number][] = [
    [140, 60, 12],
    [210, 42, 9],
    [280, 70, 10],
    [660, 50, 10],
    [740, 75, 8],
    [800, 45, 9],
  ];
  return (
    <>
      <defs>
        <linearGradient id={sky} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.goldLight} />
          <stop offset="55%" stopColor={COLORS.extraversion} />
          <stop offset="100%" stopColor="#E85A2A" />
        </linearGradient>
      </defs>
      <rect width={900} height={260} fill={`url(#${sky})`} />
      <circle cx={450} cy={140} r={80} fill="#FFEFAF" />
      <circle cx={450} cy={140} r={65} fill="#FFE28A" />
      <circle cx={450} cy={140} r={50} fill={COLORS.goldLight} />
      <path
        d="M0,200 L200,140 L400,190 L600,120 L800,180 L900,150 L900,260 L0,260 Z"
        fill="#FFA37D"
      />
      <path
        d="M0,230 L220,165 L440,215 L660,150 L860,210 L900,190 L900,260 L0,260 Z"
        fill={COLORS.extraversion}
      />
      {birds.map(([x, y, s], i) => bird(x, y, s, `b${i}`))}
      <circle cx={90} cy={235} r={7} fill={COLORS.holoMint} />
      <circle cx={820} cy={230} r={7} fill={COLORS.holoViolet} />
      <circle cx={460} cy={240} r={6} fill={COLORS.holoSky} />
    </>
  );
}

function AgreeablenessScene({ uid }: { uid: string }) {
  const sky = `sky-${uid}`;
  const groundY = 210;
  const roots = [
    `M411,${groundY} C424,${groundY + 12} 440,${groundY + 14} 456,${groundY + 24}`,
    `M513,${groundY} C500,${groundY + 12} 484,${groundY + 14} 468,${groundY + 24}`,
  ];
  return (
    <>
      <defs>
        <linearGradient id={sky} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.holoMint} />
          <stop offset="100%" stopColor={COLORS.lavender50} />
        </linearGradient>
      </defs>
      <rect width={900} height={260} fill={`url(#${sky})`} />
      <rect x={0} y={groundY} width={900} height={260 - groundY} fill="#E9E0D2" />
      {roots.map((d, i) => (
        <path key={i} d={d} stroke={COLORS.goldDark} strokeWidth={4} fill="none" strokeLinecap="round" />
      ))}
      <path d={`M406,165 L401,${groundY} L421,${groundY} L416,165 Z`} fill={COLORS.goldDark} />
      <path d={`M508,165 L503,${groundY} L523,${groundY} L518,165 Z`} fill={COLORS.goldDark} />
      <path
        d="M400,50 C440,46 468,76 470,108 C472,142 448,168 412,173 C380,177 348,165 340,136 C333,110 346,78 376,60 C384,55 393,52 400,50 Z"
        fill={COLORS.agreeableness}
      />
      <path
        d="M500,58 C536,55 560,82 562,112 C564,142 543,166 511,170 C482,174 454,163 447,135 C441,110 452,80 480,63 C488,58 495,60 500,58 Z"
        fill="#7FE09A"
      />
      <ellipse cx={368} cy={90} rx={11} ry={14} fill="#DFFCEB" />
      <circle cx={150} cy={235} r={7} fill={COLORS.stability} />
      <circle cx={720} cy={238} r={8} fill={COLORS.holoViolet} />
      <circle cx={230} cy={245} r={6} fill={COLORS.goldLight} />
      <circle cx={650} cy={230} r={5} fill={COLORS.holoSky} />
      <circle cx={800} cy={245} r={7} fill={COLORS.stability} />
      <circle cx={100} cy={248} r={5} fill={COLORS.holoMint} />
    </>
  );
}

function SummaryScene({ uid }: { uid: string }) {
  const sky = `sky-${uid}`;
  const waterY = 200;
  return (
    <>
      <defs>
        <linearGradient id={sky} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.holoMint} />
          <stop offset="45%" stopColor={COLORS.holoSky} />
          <stop offset="100%" stopColor={COLORS.holoViolet} />
        </linearGradient>
      </defs>
      <rect width={900} height={waterY} fill={`url(#${sky})`} />
      <rect y={waterY} width={900} height={260 - waterY} fill={COLORS.holoViolet} />
      <circle cx={770} cy={55} r={24} fill={COLORS.goldLight} />
      <path d={`M0,${waterY} L180,110 L360,${waterY} Z`} fill="#B9A8E8" />
      <path d={`M0,${waterY} L180,${waterY + 45} L360,${waterY} Z`} fill="#9683D6" />
      <path d={`M500,${waterY} L610,80 L720,${waterY} Z`} fill={COLORS.stability} />
      <path d={`M100,${waterY} L320,70 L540,${waterY} Z`} fill={COLORS.agreeableness} />
      <path d={`M100,${waterY} L320,${waterY + 65} L540,${waterY} Z`} fill="#3FB472" />
      <rect x={158} y={waterY - 16} width={5} height={16} fill={COLORS.goldDark} />
      <path
        d={`M160,${waterY - 55} C173,${waterY - 57} 182,${waterY - 46} 182,${waterY - 35} C182,${waterY - 24} 173,${waterY - 16} 161,${waterY - 16} C150,${waterY - 16} 141,${waterY - 24} 141,${waterY - 35} C141,${waterY - 46} 150,${waterY - 57} 160,${waterY - 55} Z`}
        fill={COLORS.conscientiousness}
      />
      <ellipse cx={660} cy={105} rx={20} ry={25} fill={COLORS.openness} />
      <line x1={651} y1={128} x2={656} y2={144} stroke={COLORS.indigo} strokeWidth={1.5} />
      <line x1={669} y1={128} x2={664} y2={144} stroke={COLORS.indigo} strokeWidth={1.5} />
      <rect x={652} y={144} width={14} height={9} rx={2} fill={COLORS.goldDark} />
      <path d="M50,45 Q64,37 78,45" stroke="white" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    </>
  );
}

const SCENES: Record<HeroKey, (props: { uid: string }) => React.ReactElement> = {
  stability: StabilityScene,
  openness: OpennessScene,
  conscientiousness: ConscientiousnessScene,
  extraversion: ExtraversionScene,
  agreeableness: AgreeablenessScene,
  summary: SummaryScene,
};

export interface FactorHeroProps {
  factor: HeroKey;
  className?: string;
}

/**
 * Stort landskapsmotiv med håndtegnet, bølgete kant som toner gradvis ut
 * mot gjennomsiktig (viser sidens bakgrunn bak). viewBox 900x260 -- sett
 * bredde via className (f.eks. w-full) og la høyden følge aspect-ratioen.
 */
export function FactorHero({ factor, className = "" }: FactorHeroProps) {
  const uid = useId();
  const maskId = `heroMask-${uid}`;
  const blurId = `heroBlur-${uid}`;
  const Scene = SCENES[factor];

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      className={["block h-auto w-full", className].join(" ")}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT}>
          <path d={WAVE_PATHS[factor]} fill="white" filter={`url(#${blurId})`} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {/* Scene-komponentene er tegnet i det opprinnelige 900x260-rommet --
            skaleres opp 1,5x vertikalt her i stedet for å tegnes på nytt. */}
        <g transform={`scale(1,${HEIGHT_SCALE})`}>
          <Scene uid={uid} />
        </g>
      </g>
    </svg>
  );
}

export default FactorHero;
