/**
 * Oversetter nettleserens WebAuthn-feil til noe en produkteier kan handle på
 * (v2.48, 31.07.2026).
 *
 * BAKGRUNN, OG HVORFOR DENNE FILEN FINNES: første versjon (v2.47) skrev
 * "Registreringen ble avbrutt" for alt som ikke var et kjent avbrudd. Det
 * var direkte misvisende -- den vanligste ekte feilen, at rpID ikke matcher
 * domenet man står på, ble presentert som om brukeren selv hadde trykket
 * avbryt. Man kan lete lenge etter en feil man tror ikke finnes.
 *
 * Regelen her: si hva som er galt OG hva som er neste steg. En feilmelding
 * som ikke peker videre er nesten like ubrukelig som ingen feilmelding.
 */

/** null = ikke en feil å vise (brukeren avbrøt selv, eller lot dialogen stå). */
export function passkeyErrorMessage(err: unknown): string | null {
  const name = err instanceof Error ? err.name : "";

  switch (name) {
    // Brukeren lukket dialogen, valgte "avbryt", eller lot den stå til den
    // gikk ut på tid. Ikke noe galt -- ikke mas om det.
    case "NotAllowedError":
    case "AbortError":
      return null;

    case "InvalidStateError":
      return "Denne enheten er allerede registrert.";

    // DEN VIKTIGSTE: nettleseren nekter fordi domenet vi oppgir ikke er det
    // samme som adressen i adressefeltet. Skjer nesten alltid fordi
    // NEXT_PUBLIC_SITE_URL mangler eller peker et annet sted.
    case "SecurityError":
      return (
        "Nettadressen stemmer ikke med oppsettet. NEXT_PUBLIC_SITE_URL må peke på nøyaktig " +
        "den adressen du står på nå. Se Drift-fanen i adminpanelet for hvilket domene " +
        "passkeys er bundet til."
      );

    case "NotSupportedError":
      return "Enheten eller nettleseren støtter ikke denne typen passkey.";

    case "ConstraintError":
      return (
        "Enheten klarte ikke lage en passkey som kan brukes til innlogging uten e-post. " +
        "Prøv en annen enhet, eller bruk engangskode."
      );

    case "UnknownError":
      return "Enheten klarte ikke fullføre. Prøv en gang til.";

    default: {
      // Alt annet: vis den faktiske meldingen. Stygt, men brukbart -- og
      // uendelig mye mer nyttig enn en pen, feilaktig gjetning.
      const detail = err instanceof Error && err.message ? err.message : String(err);
      return `Noe gikk galt: ${detail}`;
    }
  }
}
