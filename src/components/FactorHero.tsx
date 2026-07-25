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
export const HEIGHT_SCALE = 1.5;
export const VIEWBOX_WIDTH = 900;
export const VIEWBOX_HEIGHT = 260 * HEIGHT_SCALE;

export const COLORS = {
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
// etter første demping) for å jevne den ut med resten av silhuetten.
//
// 23.07.2026: x-koordinatene i alle seks er strukket til å nå helt ut til
// venstre/høyre kant (0/900) -- opprinnelig hadde konturen en liten,
// bevisst avstand til sidene (se v6-forslaget), men det ga et synlig gap
// mot resten av innholdet på siden, som skal ha samme bredde. Selve
// bølgeformen (y-verdiene) er uendret, bare strukket horisontalt.
// Se prosjektarkivet for punktlistene disse er generert fra.
//
// 24.07.2026: Emosjonell stabilitet fikk i tillegg en svakere bølge helt
// øverst (dippunktet rundt x=350-430 hevet fra y≈78 til y≈50) -- den dype
// dippen klippet toppen av solen i scenen. Solen er samtidig flyttet et
// stykke til høyre (se StabilityScene), mot de lavere fjelltoppene, som
// alene fjerner klippingen (bølgen der er allerede høy nok) -- den svakere
// dippen er en ekstra, generell demping av selve toppbølgen.
export const WAVE_PATHS: Record<HeroKey, string> = {
  stability:
    "M10.18,39 C45.8,15.0 144.2,14.5 213.8,21 C283.4,27.5 349.5,50.0 427.6,49.5 C505.7,49.0 605.8,24.5 682.13,18 C758.5,11.5 850.8,12.0 885.75,39 C920.7,66.0 889.5,139.0 891.86,180 C894.2,221.0 904.4,262.3 900,285 C895.6,307.8 883.0,308.5 865.38,316.5 C847.7,324.5 821.3,332.9 794.12,333 C767.0,333.1 736.4,317.5 702.49,317.25 C668.6,317.0 627.8,333.6 590.5,331.5 C553.2,329.4 507.4,312.9 478.51,304.5 C449.7,296.1 439.5,279.4 417.42,281.1 C395.4,282.9 373.3,306.4 346.15,315 C319.0,323.6 285.1,334.0 254.52,333 C224.0,332.0 193.4,309.3 162.9,309 C132.4,308.8 97.7,335.5 71.27,331.5 C44.8,327.5 15.9,312.8 4.07,285 C-7.8,257.3 -1.0,206.0 0,165 C1.0,124.0 -25.5,63.0 10.18,39 Z",
  openness:
    "M10.2,36 C59.5,14.0 195.6,13.0 295.92,18 C396.3,23.0 534.0,65.0 612.24,66 C690.5,67.0 719.4,28.5 765.31,24 C811.2,19.5 866.0,15.5 887.76,39 C909.5,62.5 893.9,124.0 895.92,165 C898.0,206.0 906.5,257.0 900,285 C893.5,313.0 879.6,320.0 857.14,333 C834.7,346.0 797.6,367.0 765.31,363 C733.0,359.0 697.3,310.0 663.27,309 C629.3,308.0 598.6,356.0 561.22,357 C523.8,358.0 476.2,313.5 438.78,315 C401.4,316.5 374.1,363.5 336.73,366 C299.3,368.5 251.7,330.5 214.29,330 C176.9,329.5 139.5,364.5 112.24,363 C85.0,361.5 69.0,336.5 51.02,321 C33.0,305.5 12.6,298.5 4.08,270 C-4.4,241.5 -1.0,189.0 0,150 C1.0,111.0 -39.1,58.0 10.2,36 Z",
  conscientiousness:
    "M10.2,36 C52.7,17.0 171.8,24.5 255.1,21 C338.4,17.5 447.3,16.5 510.2,15 C573.1,13.5 590.1,9.5 632.65,12 C675.2,14.5 722.8,25.5 765.31,30 C807.8,34.5 866.0,19.0 887.76,39 C909.5,59.0 893.9,119.0 895.92,150 C898.0,181.0 904.8,191.0 900,225 C895.2,259.0 900.0,329.5 867.35,354 C834.7,378.5 755.1,373.0 704.08,372 C653.1,371.0 612.2,348.5 561.22,348 C510.2,347.5 455.8,369.0 397.96,369 C340.1,369.0 268.7,348.0 214.29,348 C159.9,348.0 106.5,389.5 71.43,369 C36.4,348.5 16.0,264.0 4.08,225 C-7.8,186.0 -1.0,166.5 0,135 C1.0,103.5 -32.3,55.0 10.2,36 Z",
  extraversion:
    "M10.2,45 C45.9,21.0 141.2,27.5 214.29,21 C287.4,14.5 370.8,6.0 448.98,6 C527.2,6.0 610.5,14.5 683.67,21 C756.8,27.5 852.4,18.5 887.76,45 C923.1,71.5 893.9,140.0 895.92,180 C898.0,220.0 906.5,259.5 900,285 C893.5,310.5 883.0,319.0 857.14,333 C831.3,347.0 784.0,373.0 744.9,369 C705.8,365.0 670.1,311.0 622.45,309 C574.8,307.0 506.8,357.5 459.18,357 C411.6,356.5 377.5,305.5 336.73,306 C295.9,306.5 251.7,357.5 214.29,360 C176.9,362.5 137.8,320.0 112.24,321 C86.7,322.0 79.2,372.0 61.22,366 C43.2,360.0 14.3,318.5 4.08,285 C-6.1,251.5 -1.0,205.0 0,165 C1.0,125.0 -25.5,69.0 10.2,45 Z",
  agreeableness:
    "M10.2,39 C49.3,15.5 170.1,29.0 234.69,24 C299.3,19.0 343.5,10.5 397.96,9 C452.4,7.5 506.8,11.5 561.22,15 C615.6,18.5 670.1,25.5 724.49,30 C778.9,34.5 859.2,17.0 887.76,42 C916.3,67.0 893.9,138.0 895.92,180 C898.0,222.0 906.5,266.0 900,294 C893.5,322.0 889.8,335.5 857.14,348 C824.5,360.5 753.4,369.5 704.08,369 C654.8,368.5 608.8,345.0 561.22,345 C513.6,345.0 466.0,369.0 418.37,369 C370.8,369.0 323.1,345.0 275.51,345 C227.9,345.0 166.7,368.5 132.65,369 C98.6,369.5 92.9,360.5 71.43,348 C50.0,335.5 16.0,324.5 4.08,294 C-7.8,263.5 -1.0,207.5 0,165 C1.0,122.5 -28.9,62.5 10.2,39 Z",
  summary:
    "M10.2,39 C49.3,17.5 159.9,26.0 234.69,21 C309.5,16.0 387.8,8.5 459.18,9 C530.6,9.5 591.8,18.0 663.27,24 C734.7,30.0 849.0,21.5 887.76,45 C926.5,68.5 893.9,127.5 895.92,165 C898.0,202.5 906.5,246.0 900,270 C893.5,294.0 879.6,298.5 857.14,309 C834.7,319.5 797.6,337.3 765.31,333 C733.0,328.8 697.3,284.8 663.27,283.5 C629.3,282.3 600.3,329.3 561.22,325.5 C522.1,321.8 472.8,261.5 428.57,261 C384.4,260.5 338.4,316.8 295.92,322.5 C253.4,328.3 210.9,295.0 173.47,295.5 C136.1,296.0 99.7,329.8 71.43,325.5 C43.2,321.3 16.0,299.3 4.08,270 C-7.8,240.8 -1.0,188.5 0,150 C1.0,111.5 -28.9,60.5 10.2,39 Z",
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
      <circle cx={620} cy={90} r={55} fill={COLORS.goldLight} />
      <path
        d="M60,40 C130,30 180,55 250,42 C300,32 350,50 400,38"
        stroke="white"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M700,58 C760,50 810,66 860,56"
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

/**
 * v2.37: eksportert slik at lib/shareCard.ts (delbart avslutningskort) kan
 * gjenbruke NØYAKTIG samme scene-tegning som selve rapporten, i stedet for
 * å duplisere den -- kun selve komposisjonen rundt (bakgrunn, tekst,
 * plassering per delingsformat) er forskjellig der.
 */
export const SCENES: Record<HeroKey, (props: { uid: string }) => React.ReactElement> = {
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

export interface FactorHeroContentProps {
  factor: HeroKey;
  uid: string;
  /** Bruk en enkel rektangel-klipp i stedet for den bølgete masken (v2.37,
   * se lib/shareCard.ts) -- for det liggende delingsformatet, der motivet
   * er ment å dekke HELE kortet kant-til-kant (som et vanlig lenke-
   * forhåndsvisningsbilde), ikke tone ut mot en bakgrunn. */
  edgeToEdge?: boolean;
}

/**
 * v2.37: selve masken+scenen, UTEN den ytre `<svg>`/viewBox -- brukt av
 * BÅDE `FactorHero` under (uendret oppførsel på selve rapportsiden) OG av
 * lib/shareCard.ts sine delingskort, som trenger å plassere akkurat denne
 * grafikken i en annen ytre `<svg>` med annen størrelse/bakgrunn/tekst
 * rundt. Returnerer en Fragment, ikke en `<svg>` -- må selv plasseres inni
 * en forelder-`<svg>` med viewBox 0 0 900 {VIEWBOX_HEIGHT} (eller skaleres
 * via en omsluttende `<g transform="scale(...)">`).
 */
export function FactorHeroContent({ factor, uid, edgeToEdge = false }: FactorHeroContentProps) {
  const maskId = `heroMask-${uid}`;
  const blurId = `heroBlur-${uid}`;
  const Scene = SCENES[factor];

  return (
    <>
      <defs>
        <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT}>
          {edgeToEdge ? (
            <rect x={0} y={0} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="white" />
          ) : (
            <path d={WAVE_PATHS[factor]} fill="white" filter={`url(#${blurId})`} />
          )}
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {/* Scene-komponentene er tegnet i det opprinnelige 900x260-rommet --
            skaleres opp 1,5x vertikalt her i stedet for å tegnes på nytt. */}
        <g transform={`scale(1,${HEIGHT_SCALE})`}>
          <Scene uid={uid} />
        </g>
      </g>
    </>
  );
}

/**
 * Stort landskapsmotiv med håndtegnet, bølgete kant som toner gradvis ut
 * mot gjennomsiktig (viser sidens bakgrunn bak). viewBox 900x260 -- sett
 * bredde via className (f.eks. w-full) og la høyden følge aspect-ratioen.
 */
export function FactorHero({ factor, className = "" }: FactorHeroProps) {
  const uid = useId();

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      className={["block h-auto w-full", className].join(" ")}
      role="img"
      aria-hidden="true"
    >
      <FactorHeroContent factor={factor} uid={uid} />
    </svg>
  );
}

export default FactorHero;
