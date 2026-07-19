/**
 * Lagring for admin-panelets innstillinger (Dokument 09 §21.1, besluttet v1.5).
 *
 * v2.28 (kvalitetsrevisjon 19.07.2026, kritisk teknisk funn): flyttet fra en
 * lokal JSON-fil (.data/admin-store.json) til Netlify Blobs. Filbasert lagring
 * fungerer greit i én enkelt, langvarig lokal dev-prosess, men Netlifys
 * produksjonsmiljø har IKKE et vedvarende, delt filsystem mellom
 * serverless-forespørsler -- innstillinger satt i panelet (f.eks. "Spir er
 * slått av", eller det globale AI-taket) kunne dermed i praksis forsvinne
 * ved neste kalde start i produksjon. Samme mønster som account/blobs.ts og
 * stats/blobs.ts.
 *
 * Passkey-/WebAuthn-feltene (credential, currentChallenge) er fjernet i
 * samme runde -- admin-tilgang styres nå av vanlig e-post/kode-innlogging
 * (lib/account) + rollesjekk (lib/admin/roles.ts), se
 * OPPGAVER-FOR-PRODUKTEIER.md for begrunnelsen (lukker et kritisk
 * "først til mølla"-sikkerhetshull i den gamle passkey-registreringen).
 */

import { getStore } from "@netlify/blobs";

function manualConfig(): { siteID: string; token: string } | Record<string, never> {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  return siteID && token ? { siteID, token } : {};
}

function adminStore() {
  return getStore({ name: "femfaktorer-admin", consistency: "strong", ...manualConfig() });
}

const SETTINGS_KEY = "settings";

export interface AdminSettings {
  aiEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  aiModel: string;
  aiMaxQuestionsPerSession: number;
  aiGlobalQuestionCap: number;
}

export interface AdminStoreData {
  settings: AdminSettings;
}

const DEFAULT_SETTINGS: AdminSettings = {
  aiEnabled: true,
  maintenanceMode: false,
  maintenanceMessage: "",
  aiModel: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5",
  aiMaxQuestionsPerSession: Number(process.env.AI_MAX_QUESTIONS_PER_SESSION ?? 100),
  aiGlobalQuestionCap: Number(process.env.AI_GLOBAL_QUESTION_CAP ?? 10000),
};

export async function readStore(): Promise<AdminStoreData> {
  let stored: Partial<AdminSettings> | null = null;
  try {
    stored = (await adminStore().get(SETTINGS_KEY, { type: "json" })) as Partial<AdminSettings> | null;
  } catch {
    // Blobs utilgjengelig (f.eks. lokal `next dev` uten Netlify-kontekst/manuell config) -- fall tilbake til default.
    stored = null;
  }
  return { settings: { ...DEFAULT_SETTINGS, ...(stored ?? {}) } };
}

export async function writeStore(data: AdminStoreData): Promise<void> {
  await adminStore().setJSON(SETTINGS_KEY, data.settings);
}
