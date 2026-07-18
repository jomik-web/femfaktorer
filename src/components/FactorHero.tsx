"use client";

import { useId } from "react";
import type { DisplayFactor } from "@/lib/scoring";

/**
 * FactorHero -- Designsystem v2.0, "store motiv"-serien (godkjent forslag v6).
 *
 * Store landskapsmotiv (900x260) for hver hovedkategori + oppsummering.
 * Hvert motiv har sin egen "hovedfarge" (faktorfargen) blandet med flere
 * farger fra paletten via graderte himmel-/vann-flater, for å skape bevegelse.
 *
 * Kanten er en uregelmessig, håndtegnet bølge (Catmull-Rom -> Bezier) som
 * følger silhuetten til hovedelementet i hver scene (fjelltopper, fyrtårn,
 * trekroner osv.), i stedet for et rett eller jevnt avrundet rammeverk.
 * Bølgekonturen tones gradvis ut mot gjennomsiktig via en oppmyket maske
 * (feGaussianBlur), slik at motivet glir over i sidens bakgrunnsfarge uten
 * synlig kant. Se 09_Forslag_faktorillustrasjon_v6_bolget.docx for forslaget
 * som ble godkjent.
 */

export type HeroKey = DisplayFactor | "summary";

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
// fra kontrollpunktene i det godkjente forslaget (v6). Se prosjektarkivet
// for punktlistene disse er generert fra.
const WAVE_PATHS: Record<HeroKey, string> = {
  stability:
    "M20,26 C55.0,10.0 151.7,13.3 220,14 C288.3,14.7 353.3,30.3 430,30 C506.7,29.7 605.0,12.7 680,12 C755.0,11.3 845.7,8.0 880,26 C914.3,44.0 883.7,92.7 886,120 C888.3,147.3 898.3,172.7 894,190 C889.7,207.3 877.3,214.7 860,224 C842.7,233.3 816.7,245.8 790,246 C763.3,246.2 733.3,225.3 700,225 C666.7,224.7 626.7,246.8 590,244 C553.3,241.2 508.3,223.7 480,208 C451.7,192.3 441.7,147.7 420,150 C398.3,152.3 376.7,206.0 350,222 C323.3,238.0 290.0,247.3 260,246 C230.0,244.7 200.0,214.3 170,214 C140.0,213.7 106.0,248.0 80,244 C54.0,240.0 25.7,212.3 14,190 C2.3,167.7 9.0,137.3 10,110 C11.0,82.7 -15.0,42.0 20,26 Z",
  openness:
    "M20,24 C68.3,9.3 201.7,8.7 300,12 C398.3,15.3 533.3,43.3 610,44 C686.7,44.7 715.0,19.0 760,16 C805.0,13.0 858.7,10.3 880,26 C901.3,41.7 886.0,82.7 888,110 C890.0,137.3 898.3,171.3 892,190 C885.7,208.7 872.0,213.3 850,222 C828.0,230.7 791.7,244.7 760,242 C728.3,239.3 693.3,206.7 660,206 C626.7,205.3 596.7,237.3 560,238 C523.3,238.7 476.7,209.0 440,210 C403.3,211.0 376.7,242.3 340,244 C303.3,245.7 256.7,220.3 220,220 C183.3,219.7 146.7,243.0 120,242 C93.3,241.0 77.7,224.3 60,214 C42.3,203.7 22.3,199.0 14,180 C5.7,161.0 9.0,126.0 10,100 C11.0,74.0 -28.3,38.7 20,24 Z",
  conscientiousness:
    "M20,24 C61.7,11.3 178.3,16.3 260,14 C341.7,11.7 448.3,11.0 510,10 C571.7,9.0 588.3,6.3 630,8 C671.7,9.7 718.3,17.0 760,20 C801.7,23.0 858.7,12.7 880,26 C901.3,39.3 886.0,79.3 888,100 C890.0,120.7 896.7,127.3 892,150 C887.3,172.7 892.0,219.7 860,236 C828.0,252.3 750.0,248.7 700,248 C650.0,247.3 610.0,232.3 560,232 C510.0,231.7 456.7,246.0 400,246 C343.3,246.0 273.3,232.0 220,232 C166.7,232.0 114.3,259.7 80,246 C45.7,232.3 25.7,176.0 14,150 C2.3,124.0 9.0,111.0 10,90 C11.0,69.0 -21.7,36.7 20,24 Z",
  extraversion:
    "M20,30 C55.0,14.0 148.3,18.3 220,14 C291.7,9.7 373.3,4.0 450,4 C526.7,4.0 608.3,9.7 680,14 C751.7,18.3 845.3,12.3 880,30 C914.7,47.7 886.0,93.3 888,120 C890.0,146.7 898.3,173.0 892,190 C885.7,207.0 875.3,212.7 850,222 C824.7,231.3 778.3,248.7 740,246 C701.7,243.3 666.7,207.3 620,206 C573.3,204.7 506.7,238.3 460,238 C413.3,237.7 380.0,203.7 340,204 C300.0,204.3 256.7,238.3 220,240 C183.3,241.7 145.0,213.3 120,214 C95.0,214.7 87.7,248.0 70,244 C52.3,240.0 24.0,212.3 14,190 C4.0,167.7 9.0,136.7 10,110 C11.0,83.3 -15.0,46.0 20,30 Z",
  agreeableness:
    "M20,26 C58.3,10.3 176.7,19.3 240,16 C303.3,12.7 346.7,7.0 400,6 C453.3,5.0 506.7,7.7 560,10 C613.3,12.3 666.7,17.0 720,20 C773.3,23.0 852.0,11.3 880,28 C908.0,44.7 886.0,92.0 888,120 C890.0,148.0 898.3,177.3 892,196 C885.7,214.7 882.0,223.7 850,232 C818.0,240.3 748.3,246.3 700,246 C651.7,245.7 606.7,230.0 560,230 C513.3,230.0 466.7,246.0 420,246 C373.3,246.0 326.7,230.0 280,230 C233.3,230.0 173.3,245.7 140,246 C106.7,246.3 101.0,240.3 80,232 C59.0,223.7 25.7,216.3 14,196 C2.3,175.7 9.0,138.3 10,110 C11.0,81.7 -18.3,41.7 20,26 Z",
  summary:
    "M20,26 C58.3,11.7 166.7,17.3 240,14 C313.3,10.7 390.0,5.7 460,6 C530.0,6.3 590.0,12.0 660,16 C730.0,20.0 842.0,14.3 880,30 C918.0,45.7 886.0,85.0 888,110 C890.0,135.0 898.3,162.7 892,180 C885.7,197.3 872.0,203.0 850,214 C828.0,225.0 791.7,251.7 760,246 C728.3,240.3 693.3,181.7 660,180 C626.7,178.3 598.3,241.0 560,236 C521.7,231.0 473.3,150.7 430,150 C386.7,149.3 341.7,224.3 300,232 C258.3,239.7 216.7,195.3 180,196 C143.3,196.7 107.7,238.7 80,236 C52.3,233.3 25.7,202.7 14,180 C2.3,157.3 9.0,125.7 10,100 C11.0,74.3 -18.3,40.3 20,26 Z",
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
      viewBox="0 0 900 260"
      className={["block h-auto w-full", className].join(" ")}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={900} height={260}>
          <path d={WAVE_PATHS[factor]} fill="white" filter={`url(#${blurId})`} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <Scene uid={uid} />
      </g>
    </svg>
  );
}

export default FactorHero;
