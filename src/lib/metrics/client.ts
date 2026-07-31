/**
 * Klientsiden av den anonyme brukstellingen (v2.45, 31.07.2026).
 *
 * "Fire-and-forget", som normtellingen: venter aldri på svar, blokkerer
 * aldri navigasjon, feiler helt stille. Telling er usynlig infrastruktur --
 * en bruker skal aldri merke at den finnes, heller ikke når den er nede.
 */
import type { MetricEvent } from "@/lib/metrics/types";

export function trackEvent(
  event: MetricEvent,
  options: { durationMinutes?: number } = {}
): void {
  if (typeof window === "undefined") return;
  void fetch("/api/metrics/event", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event, ...options }),
    // keepalive lar tellingen fullføre selv om brukeren navigerer videre i
    // samme øyeblikk -- uten den mister vi særlig de tellingene som skjer
    // rett før et sidebytte, altså nettopp fullføringene.
    keepalive: true,
  }).catch(() => {
    // Stille -- se filhodet.
  });
}

/**
 * Teller hendelsen høyst én gang per nettleserøkt.
 *
 * Nødvendig for hendelser som utløses av at en skjerm VISES, ikke av at
 * noen trykker på noe: React kan montere den samme komponenten flere ganger
 * (utviklingsmodus gjør det med vilje), og brukeren kan navigere frem og
 * tilbake. Uten denne sperren ville "startet testen" telt langt flere enn
 * antallet mennesker som faktisk startet -- og da blir hele trakten
 * misvisende, siden fullføringene teller riktig.
 */
export function trackEventOncePerSession(
  event: MetricEvent,
  options: { durationMinutes?: number } = {}
): void {
  if (typeof window === "undefined") return;
  const key = `femfaktorer.telt.${event}`;
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Privat nettlesing uten lagringstilgang -- da teller vi heller én gang
    // for mye enn ingen ganger. Å miste hele trakten er verre enn litt støy.
  }
  trackEvent(event, options);
}

/** Nullstiller sperrene, slik at "ta testen på nytt" telles som et nytt forsøk. */
export function resetSessionEventGuards(): void {
  if (typeof window === "undefined") return;
  try {
    for (let i = window.sessionStorage.length - 1; i >= 0; i -= 1) {
      const key = window.sessionStorage.key(i);
      if (key?.startsWith("femfaktorer.telt.")) window.sessionStorage.removeItem(key);
    }
  } catch {
    // se over
  }
}
