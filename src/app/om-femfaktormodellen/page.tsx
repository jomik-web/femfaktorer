import type { Metadata } from "next";
import { redirect } from "next/navigation";

/**
 * Innholdet på denne ruten er slått sammen inn i /slik-fungerer (v2.5, "Om
 * Dine Fasetter"-siden) etter produkteiers ønske om én samlet, brukervennlig
 * side i stedet for tre spredte. Beholder ruten som en redirect slik at
 * eksisterende lenker/bokmerker ikke brekker.
 */
export const metadata: Metadata = {
  title: "Om femfaktormodellen",
  description:
    "Femfaktormodellen (Big Five) er den mest etterprøvde modellen for personlighet vi har. Her er hva de fem faktorene faktisk måler.",
};

export default function OmFemfaktormodellenRedirect() {
  redirect("/slik-fungerer#femfaktormodellen");
}
