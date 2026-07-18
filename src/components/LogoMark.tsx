/**
 * LogoMark -- merket for Dine Fasetter.
 *
 * Godkjent versjon (Designsystem v2.0 §8): 5 fasetter i en uregelmessig,
 * asymmetrisk kontur -- ekko av testens kjernemetafor ("fasettbildet").
 * Bevisst uten omriss-strek og uten ansikt: kontrasten til Spir (myk,
 * levende) er tilsiktet -- merket skal lese som presist og strukturert
 * ("Vei 1: bevisst kontrast" i designsystemet, ikke en inkonsistens).
 *
 * Fargene er de fem originale v2-paletttonene (mint / himmel / fiolett /
 * gull mørk / gull lys) -- IKKE de fem faktorfargene, som er forbeholdt
 * personlighetsdimensjonene i produkt-UI.
 */

interface LogoMarkProps {
  size?: number;
  className?: string;
  title?: string;
}

// Uregelmessig 5-punkts kontur + kjerne -- se design_system/logo3/gen_logo5.js.
const OUTLINE: [number, number][] = [
  [88, 10],
  [162, 58],
  [140, 178],
  [58, 190],
  [14, 88],
];
const CORE: [number, number] = [96, 92];
const FACET_COLORS = ["#5FF0C0", "#5FC0F0", "#C05FF0", "#E0A93A", "#FFE07A"];

export default function LogoMark({ size = 40, className, title = "Dine Fasetter" }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={title} className={className}>
      {OUTLINE.map((a, i) => {
        const b = OUTLINE[(i + 1) % OUTLINE.length] ?? OUTLINE[0]!;
        return (
          <path
            key={i}
            d={`M${CORE[0]},${CORE[1]} L${a[0]},${a[1]} L${b[0]},${b[1]} Z`}
            fill={FACET_COLORS[i % FACET_COLORS.length]}
          />
        );
      })}
    </svg>
  );
}
