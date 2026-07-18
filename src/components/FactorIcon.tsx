import type { ReactElement } from "react";
import type { DisplayFactor } from "@/lib/scoring";

/**
 * FactorIcon -- symbolikoner for de fem Big Five-faktorene.
 *
 * Samme visuelle språk som "feature"-ikonene i Designsystem v2.0 §6: en
 * fylt sirkel med et enkelt, hvitt strekmotiv i midten. Her brukes hver
 * faktors egen faktorfarge (§3) i stedet for holo-gradienten, slik at
 * fargen alene identifiserer faktoren -- symbolet er en støtte for
 * gjenkjenning, ikke selve identifikasjonen (viktig for fargeblinde
 * brukere, som allerede er en vurdering i RoughFactorIndicator).
 *
 * Symbolene er bevisst abstrakte (spiral, blink, bue osv.), ikke bokstavelige
 * illustrasjoner (pærer, hjerter) -- for å unngå klisjeer og holde samme
 * strenge, geometriske stil som resten av ikonsettet.
 */

const FACTOR_FILL: Record<DisplayFactor, string> = {
  openness: "fill-factor-openness",
  conscientiousness: "fill-factor-conscientiousness",
  extraversion: "fill-factor-extraversion",
  agreeableness: "fill-factor-agreeableness",
  stability: "fill-factor-stability",
};

const FACTOR_LABEL: Record<DisplayFactor, string> = {
  openness: "Åpenhet",
  conscientiousness: "Planmessighet",
  extraversion: "Ekstroversjon",
  agreeableness: "Medmenneskelighet",
  stability: "Emosjonell stabilitet",
};

function OpennessSymbol() {
  // Spiral -- nysgjerrighet, det som åpner seg.
  return (
    <>
      <path
        d="M48,20 A20,20 0 1 1 25,58"
        stroke="white"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={25} cy={58} r={4.5} fill="white" />
    </>
  );
}

function ConscientiousnessSymbol() {
  // Blink/mål -- presisjon og målrettethet.
  return (
    <>
      <circle cx={48} cy={48} r={22} stroke="white" strokeWidth={5} fill="none" />
      <circle cx={48} cy={48} r={12} stroke="white" strokeWidth={5} fill="none" />
      <circle cx={48} cy={48} r={4} fill="white" />
    </>
  );
}

function ExtraversionSymbol() {
  // Utbrudd -- energi og utadvendthet, strålende fra et sentrum.
  const rays: [number, number, number, number][] = [
    [62, 48, 74, 48],
    [57.9, 57.9, 66.4, 66.4],
    [48, 62, 48, 74],
    [38.1, 57.9, 29.6, 66.4],
    [34, 48, 22, 48],
    [38.1, 38.1, 29.6, 29.6],
    [48, 34, 48, 22],
    [57.9, 38.1, 66.4, 29.6],
  ];
  return (
    <>
      <circle cx={48} cy={48} r={8} fill="white" />
      {rays.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={5} strokeLinecap="round" />
      ))}
    </>
  );
}

function AgreeablenessSymbol() {
  // To overlappende sirkler -- forbindelse, det som møtes.
  return (
    <>
      <circle cx={38} cy={48} r={18} stroke="white" strokeWidth={5} fill="none" />
      <circle cx={58} cy={48} r={18} stroke="white" strokeWidth={5} fill="none" />
    </>
  );
}

function StabilitySymbol() {
  // Anker -- ro og forankring.
  return (
    <>
      <circle cx={48} cy={26} r={7} stroke="white" strokeWidth={5} fill="none" />
      <line x1={48} y1={33} x2={48} y2={70} stroke="white" strokeWidth={5} strokeLinecap="round" />
      <line x1={36} y1={42} x2={60} y2={42} stroke="white" strokeWidth={5} strokeLinecap="round" />
      <path d="M30,54 A18,18 0 0 0 48,72" stroke="white" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M66,54 A18,18 0 0 1 48,72" stroke="white" strokeWidth={5} fill="none" strokeLinecap="round" />
    </>
  );
}

const SYMBOLS: Record<DisplayFactor, () => ReactElement> = {
  openness: OpennessSymbol,
  conscientiousness: ConscientiousnessSymbol,
  extraversion: ExtraversionSymbol,
  agreeableness: AgreeablenessSymbol,
  stability: StabilitySymbol,
};

interface FactorIconProps {
  factor: DisplayFactor;
  size?: number;
  className?: string;
}

export function FactorIcon({ factor, size = 48, className }: FactorIconProps) {
  const Symbol = SYMBOLS[factor];
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="img"
      aria-label={FACTOR_LABEL[factor]}
      className={className}
    >
      <circle cx={48} cy={48} r={44} className={FACTOR_FILL[factor]} />
      <Symbol />
    </svg>
  );
}
