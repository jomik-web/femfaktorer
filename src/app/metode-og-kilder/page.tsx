import type { Metadata } from "next";
import { redirect } from "next/navigation";

/**
 * Innholdet på denne ruten er slått sammen inn i /slik-fungerer (v2.5, "Om
 * Dine Fasetter"-siden) etter produkteiers ønske om én samlet, brukervennlig
 * side i stedet for tre spredte. Beholder ruten som en redirect slik at
 * eksisterende lenker/bokmerker ikke brekker.
 */
export const metadata: Metadata = {
  title: "Metode og kilder",
  description:
    "Hvordan testen er bygget, hvilken forskning den bygger på, og hva den ikke kan si noe om. Åpent om forbeholdene.",
};

export default function MetodeOgKilderRedirect() {
  redirect("/slik-fungerer#metode-og-kilder");
}
