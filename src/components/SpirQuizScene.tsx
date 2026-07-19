"use client";

import { useId } from "react";
import { COLORS, SpirBody, SpirChain, SpirGlasses, SpirFace } from "./SpirMascot";

/**
 * SpirQuizScene -- landskaps-grafikk øverst på selve spørsmålsskjermen i
 * /test (v2.32, produkteiers ønske 19.07.2026: "en morsom setting" der Spir
 * tydelig stiller spørsmål til en gruppe lignende figurer som følger
 * oppmerksomt med, og en av dem rekker opp hånda).
 *
 * Valgt setting: et lite, hjemmekoselig "kunnskapsquiz på scenen"-oppsett --
 * Spir som quizvert med spørsmålskort, tre "slektninger" av Spir bak hver
 * sin pult/buzzer-podium, i samme visuelle familie (holo-gradient kropp,
 * gullkjede, solbriller) men med ulik fargevekting, slik at de leses som
 * forskjellige individer uten å bryte den etablerte "master reference"-
 * stilen. Én av de tre har hånda i taket.
 *
 * Samme bølgekant-teknikk som FactorHero/SpirHero (900x390, blurret maske)
 * for visuell konsistens med resten av produktet. Kroppen, brillene og
 * kjeden er gjenbrukt fra SpirMascot.tsx sine eksporterte bygge-blokker --
 * KUN armene her er scene-spesifikke håndtegnede tillegg (quizvert-kortet og
 * den hevede hånda), siden "master reference"-armen i SpirMascot alltid
 * hviler ved hoften og ikke passer denne scenen.
 */

const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 390;

// Samme bølgekontur som FactorHero sin "summary"-variant / SpirHero (900x390-
// rommet) -- duplisert bevisst, se samme begrunnelse i SpirHero.tsx.
const WAVE_PATH =
  "M20,39 C58.3,17.5 166.7,26.0 240,21 C313.3,16.0 390.0,8.5 460,9 C530.0,9.5 590.0,18.0 660,24 C730.0,30.0 842.0,21.5 880,45 C918.0,68.5 886.0,127.5 888,165 C890.0,202.5 898.3,246.0 892,270 C885.7,294.0 872.0,298.5 850,309 C828.0,319.5 791.7,337.3 760,333 C728.3,328.8 693.3,284.8 660,283.5 C626.7,282.3 598.3,329.3 560,325.5 C521.7,321.8 473.3,261.5 430,261 C386.7,260.5 341.7,316.8 300,322.5 C258.3,328.3 216.7,295.0 180,295.5 C143.3,296.0 107.7,329.8 80,325.5 C52.3,321.3 25.7,299.3 14,270 C2.3,240.8 9.0,188.5 10,150 C11.0,111.5 -18.3,60.5 20,39 Z";

interface FriendSpec {
  x: number;
  scale: number;
  /** Dominerende holo-farge i gradienten -- gir hver figur en egen "personlighet" i fargen. */
  stops: readonly [string, string, string];
  handUp: boolean;
}

const FRIENDS: readonly FriendSpec[] = [
  { x: 560, scale: 0.62, stops: [COLORS.holoViolet, COLORS.holoSky, COLORS.holoMint], handUp: false },
  { x: 690, scale: 0.66, stops: [COLORS.goldLight, COLORS.holoMint, COLORS.holoSky], handUp: true },
  { x: 800, scale: 0.6, stops: [COLORS.holoSky, COLORS.holoViolet, COLORS.goldDefault], handUp: false },
];

export interface SpirQuizSceneProps {
  className?: string;
}

export function SpirQuizScene({ className = "" }: SpirQuizSceneProps) {
  const uid = useId();
  const maskId = `spirQuizMask-${uid}`;
  const blurId = `spirQuizBlur-${uid}`;
  const skyId = `spirQuizSky-${uid}`;
  const hostBodyId = `spirQuizHostBody-${uid}`;
  const goldGradientId = `spirQuizGold-${uid}`;
  const lensGradientId = `spirQuizLens-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      className={["block h-auto w-full", className].join(" ")}
      role="img"
      aria-label="Illustrasjon: Spir som quizvert stiller et spørsmål til tre lignende figurer bak hver sin pult, én av dem rekker opp hånda"
    >
      <defs>
        <linearGradient id={skyId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.holoMint} />
          <stop offset="50%" stopColor={COLORS.holoSky} />
          <stop offset="100%" stopColor={COLORS.holoViolet} />
        </linearGradient>
        <linearGradient id={hostBodyId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.holoMint} />
          <stop offset="50%" stopColor={COLORS.holoSky} />
          <stop offset="100%" stopColor={COLORS.holoViolet} />
        </linearGradient>
        <linearGradient id={goldGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.goldLight} />
          <stop offset="100%" stopColor={COLORS.goldDefault} />
        </linearGradient>
        <linearGradient id={lensGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.lensDark} />
          <stop offset="100%" stopColor={COLORS.lensDarkEnd} />
        </linearGradient>
        {FRIENDS.map((f, i) => (
          <linearGradient key={i} id={`spirQuizFriend${i}-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={f.stops[0]} />
            <stop offset="55%" stopColor={f.stops[1]} />
            <stop offset="100%" stopColor={f.stops[2]} />
          </linearGradient>
        ))}
        <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT}>
          <path d={WAVE_PATH} fill="white" filter={`url(#${blurId})`} />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill={`url(#${skyId})`} />

        {/* Scenelys -- en myk spotlight-kjegle ned mot Spir. */}
        <polygon points="230,0 60,260 400,260" fill="white" opacity={0.14} filter={`url(#${blurId})`} />

        {/* Flytende aksenter, samme idé som i de andre heltefigurene. */}
        <circle cx={110} cy={50} r={5} fill={COLORS.goldLight} opacity={0.8} />
        <circle cx={430} cy={40} r={4} fill={COLORS.holoMint} opacity={0.7} />
        <circle cx={70} cy={250} r={4} fill={COLORS.goldLight} opacity={0.6} />
        <circle cx={860} cy={80} r={4} fill={COLORS.lavender100} opacity={0.7} />
        <circle cx={500} cy={35} r={3.5} fill={COLORS.holoViolet} opacity={0.6} />

        {/* Stort spørsmålstegn-skilt over scenen -- signaliserer "quiz". */}
        <g>
          <circle cx={230} cy={70} r={34} fill={COLORS.lavender100} opacity={0.95} />
          <text
            x={230}
            y={83}
            textAnchor="middle"
            fontSize={40}
            fontWeight={700}
            fill={COLORS.indigo}
            fontFamily="var(--font-display, sans-serif)"
          >
            ?
          </text>
        </g>

        {/* Podier med tre "familiemedlemmer" av Spir -- tegnes FØR verten,
            slik at verten alltid virker nærmest/størst i scenen. */}
        {FRIENDS.map((f, i) => {
          const groundY = 300;
          const bodyTranslateY = groundY - 184 * f.scale - 40; // -40: skjul under pult
          return (
            <g key={i}>
              <g transform={`translate(${f.x - 96 * f.scale},${bodyTranslateY}) scale(${f.scale})`}>
                <SpirBody gradientId={`spirQuizFriend${i}-${uid}`} />
                {/* Hevet arm for hånd-rekkeren -- tegnet i SAMME lokale koordinatrom
                    som kroppen (som SpirArm i SpirMascot.tsx), slik at den skalerer
                    og treffer riktig proporsjonalt uansett figurens størrelse.
                    Går fra skulderhøyde og klart over hodetoppen (lokal y ca. 58). */}
                {f.handUp && (
                  <>
                    <path
                      d="M134,124 Q170,94 154,32"
                      stroke={`url(#spirQuizFriend${i}-${uid})`}
                      strokeWidth={12}
                      fill="none"
                      strokeLinecap="round"
                    />
                    <circle cx={154} cy={32} r={9} fill={`url(#spirQuizFriend${i}-${uid})`} />
                  </>
                )}
                <SpirChain gradientId={goldGradientId} />
                <SpirGlasses gradientId={lensGradientId} />
                <SpirFace expression="oppmuntrende" />
              </g>

              {/* Pult/buzzer-podium -- dekker underkroppen, gir "sitter bak pult"-inntrykket. */}
              <rect
                x={f.x - 46 * f.scale}
                y={groundY - 40}
                width={92 * f.scale}
                height={40}
                rx={8}
                fill={COLORS.indigo}
                opacity={0.16}
              />
              <rect
                x={f.x - 46 * f.scale}
                y={groundY - 44}
                width={92 * f.scale}
                height={8}
                rx={4}
                fill={COLORS.lavender100}
                opacity={0.9}
              />
              <circle cx={f.x - 30 * f.scale} cy={groundY - 44} r={5 * f.scale} fill={COLORS.goldLight} />
            </g>
          );
        })}

        {/* Spir -- quizvert, med et spørsmålskort i hevet hånd. */}
        <g transform="translate(30,95) scale(1.05)">
          <ellipse cx={100} cy={184} rx={42} ry={7} fill={COLORS.lavender100} opacity={0.7} />
          {/* Vertens arm, hevet med et lite spørsmålskort -- scene-spesifikk, se filhode. */}
          <path
            d="M132,128 Q158,108 156,80"
            stroke={COLORS.holoSky}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
          />
          <g transform="translate(156,60)">
            <rect x={-20} y={-15} width={40} height={30} rx={6} fill={COLORS.lavender100} />
            <text x={0} y={9} textAnchor="middle" fontSize={22} fontWeight={700} fill={COLORS.indigo}>
              ?
            </text>
          </g>
          <SpirBody gradientId={hostBodyId} />
          <SpirChain gradientId={goldGradientId} />
          <SpirGlasses gradientId={lensGradientId} />
          <SpirFace expression="oppmuntrende" />
        </g>
      </g>
    </svg>
  );
}

export default SpirQuizScene;
