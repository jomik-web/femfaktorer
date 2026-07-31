/**
 * Grov enhetskategori ut fra skjermbredde (v2.46, 31.07.2026).
 *
 * Flyttet hit fra FeedbackPrompt.tsx fordi den nå brukes tre steder:
 * betatilbakemeldingen, det anonyme svarsettet og trakt-tellingen.
 *
 * BEVISST SKJERMBREDDE, IKKE BRUKERAGENT. En brukeragentstreng er langt mer
 * detaljert enn vi trenger (nettleser, versjon, operativsystem) og bidrar
 * dermed til å gjøre en ellers anonym innsending mer identifiserbar. Tre
 * grove kategorier er alt formålet krever: å kunne se om et problem eller et
 * frafall gjelder mobil eller desktop.
 */
export type DeviceCategory = "mobil" | "nettbrett" | "desktop" | "ukjent";

export function deviceCategory(): DeviceCategory {
  if (typeof window === "undefined") return "ukjent";
  const width = window.innerWidth;
  if (width <= 480) return "mobil";
  if (width <= 1024) return "nettbrett";
  return "desktop";
}
