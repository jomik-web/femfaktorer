"use client";

import { useId } from "react";

/**
 * SpirMascot -- maskoten "Spir", AI-veilederen i Dine Fasetter.
 *
 * v2.0 -- erstatter det opprinnelige spireskudd-konseptet (se
 * Designsystem v2.0 §2 og §1 for research-begrunnelsen: målgruppen unge
 * voksne reagerer bedre på en "ugly-cute" figur med tydelig personlighet
 * og "chill/unbothered" kroppsholdning enn på en nøytral illustrasjon).
 *
 * Kodet som SVG (ikke AI-generert bilde) for å sikre 100 % konsistens
 * mellom uttrykkene. Kropp, skygge, hvilende arm, gullkjede og solbriller
 * er "master reference" -- identiske i alle varianter. Kun øyenbryn, munn
 * og et par small aksenter (tankebobler / konfetti) endres per uttrykk.
 * Solbrillene beholdes i alle uttrykk fordi de er figurens signatur-trekk
 * (bekreftet som "beste kombinasjon" etter research-drevet iterasjon --
 * se §1 i designsystemet).
 *
 * Farger fra tailwind.config.ts (Designsystem v2.0 §3) -- hardkodet som
 * hex her fordi SVG-fyll ikke kan bruke Tailwind-klasser direkte.
 */

export type SpirExpression =
  | "noytral"
  | "tenkende"
  | "oppmuntrende"
  | "feirende";

export const COLORS = {
  holoMint: "#5FF0C0",
  holoSky: "#5FC0F0",
  holoViolet: "#C05FF0",
  goldLight: "#FFE07A",
  goldDefault: "#E0A93A",
  indigo: "#14142B",
  lavender100: "#E9E5F5",
  shine: "#AEE8F5",
  // Solbrille-glass -- kun brukt her, ikke et globalt token.
  lensDark: "#1A1A2E",
  lensDarkEnd: "#3A3A5E",
} as const;

interface SpirMascotProps {
  expression?: SpirExpression;
  size?: number;
  className?: string;
  title?: string;
}

const CX = 96;
const CY = 94;

/** Bakke-skygge -- identisk i alle uttrykk. */
export function SpirGround() {
  return <ellipse cx={100} cy={184} rx={42} ry={7} fill={COLORS.lavender100} opacity={0.7} />;
}

/** Hvilende arm ("unbothered") -- albue ut, hånd ved hoften. Identisk i alle uttrykk. */
export function SpirArm() {
  return (
    <>
      <path
        d="M56,132 Q30,138 34,160"
        stroke={COLORS.holoSky}
        strokeWidth={12}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={34} cy={160} r={9} fill={COLORS.holoSky} />
    </>
  );
}

/** Slouchy, vektforskjøvet kropp med holo-gradient + shine. Identisk i alle uttrykk. */
export function SpirBody({ gradientId }: { gradientId: string }) {
  return (
    <>
      <path
        d="M96,58 C126,54 150,74 150,104 C150,134 148,166 108,178 C84,184 58,172 50,146 C42,118 50,84 74,64 C81,59 88,58 96,58 Z"
        fill={`url(#${gradientId})`}
      />
      <ellipse cx={78} cy={90} rx={16} ry={19} fill={COLORS.shine} />
    </>
  );
}

/** Gullkjede + anheng -- identisk i alle uttrykk. */
export function SpirChain({ gradientId }: { gradientId: string }) {
  return (
    <>
      <path
        d="M70,142 Q96,162 122,140"
        stroke={`url(#${gradientId})`}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="1,8"
      />
      <circle cx={96} cy={163} r={7} fill={`url(#${gradientId})`} />
      <circle cx={96} cy={163} r={7} fill="none" stroke="#8A6A1A" strokeWidth={1.3} />
    </>
  );
}

/** Solbriller dyttet ned -- figurens signatur-trekk. Identisk i alle uttrykk. */
export function SpirGlasses({ gradientId }: { gradientId: string }) {
  return (
    <>
      <ellipse cx={CX - 19} cy={CY + 6} rx={16} ry={11} fill={`url(#${gradientId})`} />
      <ellipse cx={CX + 20} cy={CY + 3} rx={16} ry={11} fill={`url(#${gradientId})`} />
      <rect x={CX - 4} y={CY + 2} width={8} height={3.5} fill={COLORS.lensDark} />
      <ellipse cx={CX + 13} cy={CY - 1} rx={3.5} ry={2} fill="white" opacity={0.6} />
    </>
  );
}

function ThoughtDots() {
  return (
    <>
      <circle cx={140} cy={72} r={3} fill={COLORS.lavender100} stroke={COLORS.indigo} strokeWidth={1.5} />
      <circle cx={150} cy={60} r={4} fill={COLORS.lavender100} stroke={COLORS.indigo} strokeWidth={1.5} />
      <circle cx={162} cy={46} r={5.5} fill={COLORS.lavender100} stroke={COLORS.indigo} strokeWidth={1.5} />
    </>
  );
}

function ConfettiBits() {
  const bits = [
    { x: 46, y: 44, c: COLORS.goldLight, r: 4 },
    { x: 150, y: 40, c: COLORS.holoViolet, r: 4.5 },
    { x: 34, y: 78, c: COLORS.holoMint, r: 3.5 },
    { x: 164, y: 76, c: COLORS.goldDefault, r: 4 },
    { x: 100, y: 24, c: COLORS.holoSky, r: 4 },
  ];
  return (
    <>
      {bits.map((b, i) => (
        <rect key={i} x={b.x - b.r} y={b.y - b.r} width={b.r * 2} height={b.r * 2} rx={1.5} fill={b.c} />
      ))}
    </>
  );
}

/** Munn med liten hvit tann -- brukt i noytral, oppmuntrende. */
function SmileWithTooth({ d }: { d: string }) {
  return (
    <>
      <path d={d} stroke={COLORS.indigo} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <path d={`M${CX + 1},${CY + 30} L${CX + 2.5},${CY + 34.5} L${CX + 5},${CY + 29.5} Z`} fill="white" />
    </>
  );
}

/** Ansikt over/under solbrillene -- eneste elementet som varierer mellom uttrykk. */
export function SpirFace({ expression }: { expression: SpirExpression }) {
  switch (expression) {
    case "tenkende":
      return (
        <>
          {/* venstre øyenbryn: hevet og granskende */}
          <path
            d={`M${CX - 31},${CY - 13} Q${CX - 19},${CY - 19} ${CX - 7},${CY - 12}`}
            stroke={COLORS.indigo}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          {/* høyre øye: smalnet, fokusert */}
          <path
            d={`M${CX + 9},${CY - 7} Q${CX + 20},${CY - 9} ${CX + 31},${CY - 7}`}
            stroke={COLORS.indigo}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          {/* munn: flat, litt på skjeve -- undrende */}
          <path
            d={`M${CX - 8},${CY + 28} Q${CX + 2},${CY + 26} ${CX + 12},${CY + 29}`}
            stroke={COLORS.indigo}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <ThoughtDots />
        </>
      );
    case "oppmuntrende":
      return (
        <>
          <path
            d={`M${CX - 30},${CY - 12} Q${CX - 19},${CY - 17} ${CX - 8},${CY - 12}`}
            stroke={COLORS.indigo}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${CX + 8},${CY - 12} Q${CX + 20},${CY - 17} ${CX + 32},${CY - 12}`}
            stroke={COLORS.indigo}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <SmileWithTooth d={`M${CX - 11},${CY + 28} Q${CX + 1},${CY + 37} ${CX + 15},${CY + 26}`} />
          <circle cx={CX - 33} cy={CY + 19} r={6} fill={COLORS.goldLight} opacity={0.6} />
          <circle cx={CX + 33} cy={CY + 19} r={6} fill={COLORS.goldLight} opacity={0.6} />
        </>
      );
    case "feirende":
      return (
        <>
          <path
            d={`M${CX - 31},${CY - 15} Q${CX - 19},${CY - 21} ${CX - 7},${CY - 15}`}
            stroke={COLORS.indigo}
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${CX + 7},${CY - 15} Q${CX + 20},${CY - 21} ${CX + 31},${CY - 15}`}
            stroke={COLORS.indigo}
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx={CX + 2} cy={CY + 30} rx={13} ry={9} fill={COLORS.indigo} />
          <ellipse cx={CX + 2} cy={CY + 26} rx={10} ry={4} fill={COLORS.goldLight} opacity={0.85} />
          <ConfettiBits />
        </>
      );
    case "noytral":
    default:
      return (
        <>
          {/* venstre øyenbryn: avslappet */}
          <path
            d={`M${CX - 30},${CY - 10} Q${CX - 19},${CY - 15} ${CX - 8},${CY - 10}`}
            stroke={COLORS.indigo}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          {/* høyre øye: blunk -- fanger over brillekanten */}
          <path
            d={`M${CX + 10},${CY - 9} Q${CX + 20},${CY - 13} ${CX + 30},${CY - 9}`}
            stroke={COLORS.indigo}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <SmileWithTooth d={`M${CX - 9},${CY + 30} Q${CX + 1},${CY + 35} ${CX + 13},${CY + 26}`} />
        </>
      );
  }
}

export default function SpirMascot({
  expression = "noytral",
  size = 160,
  className,
  title,
}: SpirMascotProps) {
  const uid = useId().replace(/:/g, "");
  const bodyGradientId = `spirBody-${uid}`;
  const goldGradientId = `spirGold-${uid}`;
  const lensGradientId = `spirLens-${uid}`;

  const label =
    title ??
    {
      noytral: "Spir, nøytral",
      tenkende: "Spir tenker",
      oppmuntrende: "Spir oppmuntrer",
      feirende: "Spir feirer",
    }[expression];

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={label} className={className}>
      <defs>
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
      </defs>
      <SpirGround />
      <SpirArm />
      <SpirBody gradientId={bodyGradientId} />
      <SpirChain gradientId={goldGradientId} />
      <SpirGlasses gradientId={lensGradientId} />
      <SpirFace expression={expression} />
    </svg>
  );
}
