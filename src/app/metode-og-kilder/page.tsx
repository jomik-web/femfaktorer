import { redirect } from "next/navigation";

/**
 * Innholdet på denne ruten er slått sammen inn i /slik-fungerer (v2.5, "Om
 * FemFaktorer"-siden) etter produkteiers ønske om én samlet, brukervennlig
 * side i stedet for tre spredte. Beholder ruten som en redirect slik at
 * eksisterende lenker/bokmerker ikke brekker.
 */
export default function MetodeOgKilderRedirect() {
  redirect("/slik-fungerer#metode-og-kilder");
}
