import { ButtonHTMLAttributes, forwardRef } from "react";

/**
 * Button -- Designsystem v2.0.
 *
 * Tre varianter:
 * - primary: hel himmelblå bakgrunn (holo.sky), indigo tekst -- var
 *   holografisk gradient frem til v2.27, endret til flat farge på
 *   produkteiers ønske. Brukes til ÉN hovedhandling per skjerm (start test,
 *   neste spørsmål, se resultat).
 * - secondary: lavendel-bakgrunn, indigo tekst. Sekundære handlinger.
 * - ghost: gjennomsiktig, indigo tekst, kun understrek/farge ved hover.
 *   Lavest visuell vekt -- avbryt, tilbake, lenke-aktige handlinger.
 *
 * Bruker font-display (Bricolage Grotesque) for knappetekst -- gir mer
 * personlighet enn Inter på korte, iøynefallende tekstbiter.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-holo-sky text-indigo shadow-sm hover:opacity-90 hover:shadow-md active:opacity-100 active:scale-[0.98]",
  secondary:
    "bg-lavender-100 text-indigo hover:bg-lavender-400/40 active:scale-[0.98]",
  ghost:
    "bg-transparent text-indigo hover:bg-lavender-50 active:scale-[0.98]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-2xl",
};

/**
 * Delt klassebygger for knappestil -- brukes av <Button> selv, men også
 * eksportert slik at navigasjonselementer som MÅ være en <Link>/<a> (og
 * derfor ikke kan bruke <Button>, som alltid rendrer <button>) kan få
 * identisk, WCAG-korrekt styling i stedet for å hardkode f.eks.
 * "bg-holo-sky ... text-white" lokalt i hver fil (se kvalitetsrevisjon
 * 2026-07-24, kritisk funn #2 -- kontrastbrudd som spredte seg nettopp
 * fordi knappestil ble kopiert manuelt i stedet for delt).
 */
export function buttonClassNames(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = ""
): string {
  return [
    "font-display font-semibold transition-all duration-150 inline-block",
    "disabled:opacity-40 disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-holo-skyText focus-visible:ring-offset-2",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ].join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button ref={ref} className={buttonClassNames(variant, size, className)} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
