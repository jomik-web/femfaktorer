import { InputHTMLAttributes, forwardRef } from "react";

/**
 * Input -- Designsystem v2.0.
 *
 * Enkelt tekstfelt til skjemaer (kontoopprettelse, admin-innlogging m.m.).
 * Nøytral lavendel-kant i hvile, holo-himmelblå kant + myk ring ved fokus.
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid = false, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          "w-full rounded-lg border bg-white px-4 py-2.5 text-indigo placeholder:text-lavender-400",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-holo-sky/40",
          invalid
            ? "border-factor-stability focus:border-factor-stability"
            : "border-lavender-400/60 focus:border-holo-sky",
          className,
        ].join(" ")}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
