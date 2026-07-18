import { HTMLAttributes } from "react";

/**
 * PageBackground -- Designsystem v2.0.
 *
 * Delt, myk bakgrunnsgradient (lavendel -> hvit) brukt på sidenivå. Gir
 * siden dybde og "tiltalende" karakter uten å konkurrere med innholdet --
 * gradienten er svak og går mot hvit/indigo før den når midten av skjermen.
 */
export function PageBackground({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "min-h-screen bg-gradient-to-b from-lavender-50 via-white to-white",
        "dark:from-indigo dark:via-indigo dark:to-indigo",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
