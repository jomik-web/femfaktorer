/**
 * Enkel fillagring for admin-panelet (Dokument 09 §21.1, besluttet v1.5).
 *
 * ÆRLIG BEGRENSNING: dette er en JSON-fil på disk, ikke en ekte database.
 * Det fungerer greit for én admin-bruker på én Netlify-instans i utviklings-
 * /testfasen, men Netlifys produksjonsmiljø har IKKE et vedvarende, delt
 * filsystem mellom forespørsler (serverless-funksjoner starter ofte "kaldt").
 * Før reell drift i produksjon MÅ dette flyttes til en ekte datalagring
 * (f.eks. Netlify Blobs, som er tilgjengelig i samme plattform og krever
 * minimal endring i dette laget sitt grensesnitt). Denne filen er bevisst
 * isolert til én modul nettopp for at den byttingen skal bli enkel.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "admin-store.json");

export interface PasskeyCredential {
  credentialId: string;
  publicKey: string; // base64url
  counter: number;
  transports?: string[];
}

export interface AdminSettings {
  aiEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  aiModel: string;
  aiMaxQuestionsPerSession: number;
  aiGlobalQuestionCap: number;
}

export interface AdminStoreData {
  credential: PasskeyCredential | null;
  currentChallenge: string | null;
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

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_FILE);
  } catch {
    const initial: AdminStoreData = {
      credential: null,
      currentChallenge: null,
      settings: DEFAULT_SETTINGS,
    };
    await fs.writeFile(STORE_FILE, JSON.stringify(initial, null, 2));
  }
}

export async function readStore(): Promise<AdminStoreData> {
  await ensureFile();
  const raw = await fs.readFile(STORE_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw) as AdminStoreData;
    return { ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
  } catch {
    return { credential: null, currentChallenge: null, settings: DEFAULT_SETTINGS };
  }
}

export async function writeStore(data: AdminStoreData): Promise<void> {
  await ensureFile();
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2));
}
