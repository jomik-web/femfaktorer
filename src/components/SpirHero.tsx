"use client";

import { useId } from "react";
import { COLORS, SpirGround, SpirArm, SpirBody, SpirChain, SpirGlasses, SpirFace } from "./SpirMascot";

/**
 * SpirHero -- landskaps-grafikk øverst på /spir, i samme visuelle språk som
 * FactorHero på resultatsiden (håndtegnet bølgekant som toner ut mot
 * gjennomsiktig, viser sidens bakgrunn bak). Bruker samme bølgekontur som
 * FactorHero sin "summary"-variant (900x390-rommet) for gjenkjennelig
 * konsistens mellom sidene ("inspirasjon fra analysesidene", produkteiers
 * ønske 19.07.2026).
 *
 * Komposisjon: en talebobbel til venstre representerer BRUKERENS side av
 * samtalen (tre prikker, samme visuelle idé som en "skriver …"-indikator).
 * Spir er plassert til høyre -- bokstavelig "på andre siden" av bobla --
 * speilvendt (scale(-1,1)) slik at figuren vender MOT bobla, med
 * tankeprikkene fra "tenkende"-uttrykket da trekkende opp mot venstre,
 * mot brukerens melding. Aktiviteten (å tenke/lytte) er selve poenget:
 * det er nøyaktig det Spir gjør i en ekte samtale.
 *
 * Gjenbruker Spir sine egne bygge-blokker (SpirGround/SpirArm/SpirBody/...)
 * fra SpirMascot.tsx i stedet for å tegne figuren på nytt, nettopp for å
 * garantere 100 % visuell konsistens med maskoten ellers i produktet (se
 * "master reference"-prinsippet i SpirMascot.tsx sitt filhode).
 */

const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 390;

// Samme bølgekontur som FactorHero sin "summary"-variant (900x390-rommet) --
// se FactorHero.tsx WAVE_PATHS.summary. Duplisert bevisst (ikke importert)
// siden FactorHero ikke eksporterer sine konstanter, og denne ene stien ikke
// er verdt en delt modul for.
const WAVE_PATH =
  "M20,39 C58.3,17.5 166.7,26.0 240,21 C313.3,16.0 390.0,8.5 460,9 C530.0,9.5 590.0,18.0 660,24 C730.0,30.0 842.0,21.5 880,45 C918.0,68.5 886.0,127.5 888,165 C890.0,202.5 898.3,246.0 892,270 C885.7,294.0 872.0,298.5 850,309 C828.0,319.5 791.7,337.3 760,333 C728.3,328.8 693.3,284.8 660,283.5 C626.7,282.3 598.3,329.3 560,325.5 C521.7,321.8 473.3,261.5 430,261 C386.7,260.5 341.7,316.8 300,322.5 C258.3,328.3 216.7,295.0 180,295.5 C143.3,296.0 107.7,329.8 80,325.5 C52.3,321.3 25.7,299.3 14,270 C2.3,240.8 9.0,188.5 10,150 C11.0,111.5 -18.3,60.5 20,39 Z";

export interface SpirHeroProps {
  className?: string;
}

export function SpirHero({ className = "" }: SpirHeroProps) {
  const uid = useId();
  const maskId = `spirHeroMask-${uid}`;
  const blurId = `spirHeroBlur-${uid}`;
  const skyId = `spirHeroSky-${uid}`;
  const bodyGradientId = `spirHeroBody-${uid}`;
  const goldGradientId = `spirHeroGold-${uid}`;
  const lensGradientId = `spirHeroLens-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      className={["block h-auto w-full", className].join(" ")}
      role="img"
      aria-label="Illustrasjon: en talebobbel og Spir, som tenker, på hver sin side av en samtale"
    >
      <defs>
        <linearGradient id={skyId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.holoMint} />
          <stop offset="50%" stopColor={COLORS.holoSky} />
          <stop offset="100%" stopColor={COLORS.holoViolet} />
        </linearGradient>
        <linearGradient id={bodyGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
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
        <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT}>
          <path d={WAVE_PATH} fill="white" filter={`url(#${blurId})`} />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill={`url(#${skyId})`} />

        {/* Flytende aksenter -- samme idé som i FactorHero-scenene. */}
        <circle cx={120} cy={60} r={5} fill={COLORS.goldLight} opacity={0.8} />
        <circle cx={430} cy={45} r={4} fill={COLORS.holoMint} opacity={0.8} />
        <circle cx={500} cy={330} r={5} fill={COLORS.holoViolet} opacity={0.6} />
        <circle cx={70} cy={260} r={4} fill={COLORS.goldLight} opacity={0.6} />
        <circle cx={820} cy={90} r={4} fill={COLORS.lavender100} opacity={0.7} />

        {/* Talebobbel -- representerer BRUKERENS side av samtalen. */}
        <path
          d="M146,140 H320 A28,28 0 0 1 348,168 V228 A28,28 0 0 1 320,256 H185 L150,288 L163,256 H146 A28,28 0 0 1 118,228 V168 A28,28 0 0 1 146,140 Z"
          fill={COLORS.lavender100}
          opacity={0.95}
        />
        <circle cx={193} cy={198} r={7} fill={COLORS.indigo} opacity={0.35} />
        <circle cx={233} cy={198} r={7} fill={COLORS.indigo} opacity={0.35} />
        <circle cx={273} cy={198} r={7} fill={COLORS.indigo} opacity={0.35} />

        {/* Spir -- speilvendt slik at figuren vender mot bobla til venstre. */}
        <g transform="translate(800,10) scale(-1.35,1.35)">
          <SpirGround />
          <SpirArm />
          <SpirBody gradientId={bodyGradientId} />
          <SpirChain gradientId={goldGradientId} />
          <SpirGlasses gradientId={lensGradientId} />
          <SpirFace expression="tenkende" />
        </g>
      </g>
    </svg>
  );
}

export default SpirHero;
