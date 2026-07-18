import { HTMLAttributes } from "react";

/**
 * Card -- Designsystem v2.0.
 *
 * Myk, avrundet flate (2xl-radius) på lavendel- eller hvit bakgrunn.
 * `accent` legger på en 4px holografisk gradient-stripe øverst -- bruk
 * sparsomt, kun for å fremheve ett kort blant flere (f.eks. anbefalt
 * resultat-kort, "din mest fremtredende fasett").
 */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean;
  tone?: "white" | "lavender";
}

export function Card({
  accent = false,
  tone = "white",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl p-6 shadow-sm",
        tone === "white" ? "bg-white" : "bg-lavender-100",
        "border border-lavender-400/30",
        className,
      ].join(" ")}
      {...props}
    >
      {accent && (
        <span className="absolute inset-x-0 top-0 h-1 bg-holo-gradient" aria-hidden="true" />
      )}
      {children}
    </div>
  );
}
