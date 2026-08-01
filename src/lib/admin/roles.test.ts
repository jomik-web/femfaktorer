import { describe, it, expect } from "vitest";
import {
  BOOTSTRAP_ADMIN_EMAIL,
  isAdminEmail,
  removeAdminEmail,
} from "@/lib/admin/roles";

/**
 * Tester for admin-rollene (v2.50, kvalitetsrevisjon 31.07.2026 kveld,
 * funn 5.2).
 *
 * AVGRENSNING: disse testene dekker invariantene som IKKE er avhengige av
 * lagringen. Netlify Blobs finnes ikke i testmiljøet, og readAdminEmails()
 * fanger den feilen og returnerer en tom liste -- som er nøyaktig den
 * tilstanden vi vil teste mot her: «lagringen er utilgjengelig, hva skjer
 * da?» Svaret skal være at bootstrap-adminen fortsatt slipper inn og at
 * ingen andre gjør det. Det er den viktigste egenskapen modulen har, og den
 * som ville vært mest alvorlig å bryte.
 *
 * Testene for selve listelagringen (addAdminEmail/removeAdminEmail mot en
 * ekte butikk) hører hjemme i en integrasjonstest med et Blobs-testmiljø, og
 * er ikke forsøkt etterlignet med mocks her -- en mock av lagringen ville
 * bare bekreftet at mocken oppfører seg som mocken.
 */
describe("BOOTSTRAP_ADMIN_EMAIL", () => {
  it("er normalisert (små bokstaver, uten omkringliggende mellomrom)", () => {
    // Sammenligningen i isAdminEmail skjer mot en normalisert verdi. Er
    // konstanten selv ikke normalisert, ville produkteier i praksis vært
    // utestengt fra sitt eget panel.
    expect(BOOTSTRAP_ADMIN_EMAIL).toBe(BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase());
  });

  it("er en ikke-tom, gyldig e-postadresse", () => {
    expect(BOOTSTRAP_ADMIN_EMAIL.length).toBeGreaterThan(0);
    expect(BOOTSTRAP_ADMIN_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});

describe("isAdminEmail -- uten tilgjengelig lagring", () => {
  it("gir admin til bootstrap-adressen", async () => {
    await expect(isAdminEmail(BOOTSTRAP_ADMIN_EMAIL)).resolves.toBe(true);
  });

  it("gir admin til bootstrap-adressen uansett skrivemåte", async () => {
    // En bruker som skriver e-posten sin med stor forbokstav ved innlogging
    // skal ikke miste admin-tilgangen av den grunn.
    await expect(isAdminEmail(BOOTSTRAP_ADMIN_EMAIL.toUpperCase())).resolves.toBe(true);
    await expect(isAdminEmail(`  ${BOOTSTRAP_ADMIN_EMAIL}  `)).resolves.toBe(true);
  });

  it("nekter alle andre adresser", async () => {
    await expect(isAdminEmail("noen.andre@example.com")).resolves.toBe(false);
    await expect(isAdminEmail("admin@example.com")).resolves.toBe(false);
  });

  it("nekter tomme og manglende verdier i stedet for å krasje", async () => {
    // Kalles med session.email, som i prinsippet kan være hva som helst hvis
    // noe over har gått galt. Da skal svaret være «nei», ikke et unntak som
    // bobler opp og gir 500 på en admin-rute.
    await expect(isAdminEmail(null)).resolves.toBe(false);
    await expect(isAdminEmail(undefined)).resolves.toBe(false);
    await expect(isAdminEmail("")).resolves.toBe(false);
  });
});

describe("removeAdminEmail -- vern om den faste adminen", () => {
  it("nekter å fjerne bootstrap-adminen", async () => {
    // Uten dette vernet kunne en admin ved et uhell (eller en angriper med
    // en kapret admin-økt) låst produkteier permanent ute av sitt eget
    // system -- nøyaktig den feilen det gamle passkey-oppsettet kunne føre
    // til, og som denne modulen ble skrevet for å hindre.
    const result = await removeAdminEmail(BOOTSTRAP_ADMIN_EMAIL);
    expect(result.ok).toBe(false);
  });

  it("nekter også når adressen skrives med annen store/små-skrift", async () => {
    const result = await removeAdminEmail(BOOTSTRAP_ADMIN_EMAIL.toUpperCase());
    expect(result.ok).toBe(false);
  });
});
