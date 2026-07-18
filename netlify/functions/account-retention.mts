import { getStore } from "@netlify/blobs";
import {
  computeAccountResultExpiry,
  ACCOUNT_RESULT_REMINDER_DAYS_BEFORE,
  normalizeAccountHistory,
  type StoredAccountResult,
} from "../../src/lib/account/types";

/**
 * Planlagt (scheduled) Netlify-funksjon, v2.7. Kjører daglig og håndhever
 * 12-månedersgrensen for lagrede kontoresultater (Dokument 07-oppfølging,
 * produkteiers ønske: "automatisk sletting av lagrede kontoresultater etter
 * 12 måneder", med e-postpåminnelse cirka 30 dager før).
 *
 * VIKTIG -- egen fil, IKKE en del av Next.js-appen: Netlify bygger filer i
 * netlify/functions/ separat fra Next.js-appen (esbuild, ikke Next sin egen
 * bundler). Denne filen unngår derfor bevisst "@/..."-aliaser i
 * VERDI-importer (kun relative stier), siden esbuild ikke nødvendigvis
 * kjenner til tsconfig sine path-aliaser. Type-importer (`import type`)
 * er trygge uansett -- de fjernes helt før noe skal løses opp.
 *
 * Krever ingen ny miljøvariabel -- gjenbruker RESEND_API_KEY,
 * RESEND_FROM_ADDRESS, NEXT_PUBLIC_SITE_URL og (ev.) NETLIFY_BLOBS_SITE_ID/
 * NETLIFY_BLOBS_TOKEN, alle allerede dokumentert i .env.example.
 *
 * Netlify oppdager og planlegger denne funksjonen automatisk ut fra
 * `config.schedule` under -- ingen egen oppføring i netlify.toml er
 * nødvendig (se Netlifys dokumentasjon om "Scheduled Functions").
 */

function manualBlobsConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

function accountStore() {
  return getStore({ name: "femfaktorer-accounts", consistency: "strong", ...manualBlobsConfig() });
}

const RESEND_API_URL = "https://api.resend.com/emails";

async function sendRetentionReminderEmail(email: string, expiry: Date): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_ADDRESS;
  if (!apiKey || !from) return false;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://femfaktorer.no";
  const expiryText = expiry.toLocaleDateString("no-NO", { year: "numeric", month: "long", day: "numeric" });

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: email,
        subject: "Det lagrede FemFaktorer-resultatet ditt slettes snart",
        html:
          `<p>Hei,</p>` +
          `<p>Det lagrede testresultatet ditt hos FemFaktorer slettes automatisk <strong>${expiryText}</strong>, ` +
          `12 måneder etter at det sist ble lagret.</p>` +
          `<p>Vil du beholde tilgangen, logger du bare inn på nytt og lagrer resultatet igjen -- da starter ` +
          `en ny 12-månedersperiode: <a href="${siteUrl}/logg-inn">${siteUrl}/logg-inn</a></p>` +
          `<p>Vil du heller ta vare på resultatet slik det er nå, kan du logge inn og laste det ned som PDF ` +
          `før fristen.</p>` +
          `<p>Gjør du ingenting, slettes resultatet automatisk på datoen over, og kan ikke gjenopprettes.</p>`,
        text:
          `Hei,\n\nDet lagrede testresultatet ditt hos FemFaktorer slettes automatisk ${expiryText}, ` +
          `12 måneder etter at det sist ble lagret.\n\n` +
          `Vil du beholde tilgangen, logger du bare inn på nytt og lagrer resultatet igjen -- da starter ` +
          `en ny 12-månedersperiode: ${siteUrl}/logg-inn\n\n` +
          `Vil du heller ta vare på resultatet slik det er nå, kan du logge inn og laste det ned som PDF ` +
          `før fristen.\n\n` +
          `Gjør du ingenting, slettes resultatet automatisk på datoen over, og kan ikke gjenopprettes.`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default async () => {
  const store = accountStore();
  const now = new Date();

  let deletedEntries = 0;
  let deletedAccounts = 0;
  let reminded = 0;
  let checked = 0;

  // v2.27: en konto lagrer nå en HISTORIKK av resultater (eldst -> nyest),
  // ikke bare ett -- se doc-kommentaren på normalizeAccountHistory() i
  // types.ts. Hvert element i historikken utløper UAVHENGIG av de andre,
  // 12 måneder etter sitt eget `savedAt` -- ikke etter historikkens siste
  // oppføring. Kontoen (hele nøkkelen) slettes først når historikken blir tom.
  for await (const { blobs } of store.list({ paginate: true })) {
    for (const { key } of blobs) {
      checked += 1;
      let raw: unknown = null;
      try {
        raw = await store.get(key, { type: "json" });
      } catch {
        continue; // Korrupt/utilgjengelig post -- rør den ikke, prøv igjen neste kjøring.
      }

      const history = normalizeAccountHistory(raw);
      if (history.length === 0) continue;

      let changed = false;
      const kept: StoredAccountResult[] = [];

      for (const entry of history) {
        const expiry = computeAccountResultExpiry(entry.savedAt);

        if (now >= expiry) {
          deletedEntries += 1;
          changed = true;
          continue; // denne oppføringen utgår -- tas ikke med videre
        }

        const reminderThreshold = new Date(expiry);
        reminderThreshold.setDate(reminderThreshold.getDate() - ACCOUNT_RESULT_REMINDER_DAYS_BEFORE);

        if (now >= reminderThreshold && !entry.reminderSentAt) {
          const sent = await sendRetentionReminderEmail(key, expiry);
          if (sent) {
            kept.push({ ...entry, reminderSentAt: now.toISOString() });
            changed = true;
            reminded += 1;
            continue;
          }
        }

        kept.push(entry);
      }

      if (!changed) continue;

      if (kept.length === 0) {
        try {
          await store.delete(key);
          deletedAccounts += 1;
        } catch {
          // Prøv igjen neste kjøring.
        }
      } else {
        try {
          await store.setJSON(key, kept);
        } catch {
          // Prøv igjen neste kjøring.
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, checked, reminded, deletedEntries, deletedAccounts }),
    { headers: { "content-type": "application/json" } }
  );
};

export const config = { schedule: "@daily" };
