/**
 * Lokal lagring av testsvar i nettleseren. Testsvarene forlater ALDRI enheten
 * med mindre brukeren aktivt starter en AI-samtale (se Dokument 07 §2, §5).
 *
 * Krav (Dokument 09 §10.3, Dokument 03 §8):
 *  - Data skal avvises dersom format/versjon/item-sett ikke stemmer -- aldri
 *    stol ukritisk på lagrede data.
 *  - Systemet skal aldri krasje ved ugyldige lagrede data.
 */

import { ALL_QUESTIONS } from "@/data/questions";
import { isValidAnswerValue, type AnswerMap } from "@/lib/scoring";

const STORAGE_KEY = "femfaktorer.korttest.v1";
// Bump denne ved enhver endring i spørsmålssett eller svarformat.
// v2 (120-spørsmål-utvidelsen): et lagret svar er nå gyldig så lenge
// spørsmål-iden finnes i det GJELDENDE spørsmålssettet -- ikke bare hvis
// hele det lagrede settet er identisk med dagens. Dette gjør at en bruker
// som har stoppet ved 50 av 120 spørsmål ikke mister svarene sine bare fordi
// det lagrede settet er en delmengde av alle spørsmålene.
const STORAGE_VERSION = 2;

interface StoredPayload {
  version: number;
  answers: AnswerMap;
  /** Satt når brukeren aktivt har valgt å fortsette forbi de første 50. */
  continuedToFull?: boolean;
  updatedAt: string;
}

const currentQuestionIds = new Set(ALL_QUESTIONS.map((q) => q.id));

export function loadAnswers(): { answers: AnswerMap; continuedToFull: boolean } {
  if (typeof window === "undefined") return { answers: {}, continuedToFull: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { answers: {}, continuedToFull: false };
    const parsed: unknown = JSON.parse(raw);
    if (!isValidStoredPayload(parsed)) return { answers: {}, continuedToFull: false };
    if (parsed.version !== STORAGE_VERSION) return { answers: {}, continuedToFull: false };

    const cleaned: AnswerMap = {};
    for (const [id, value] of Object.entries(parsed.answers)) {
      if (currentQuestionIds.has(id) && isValidAnswerValue(value)) {
        cleaned[id] = value;
      }
    }
    return { answers: cleaned, continuedToFull: parsed.continuedToFull === true };
  } catch {
    // Ugyldig/korrupt JSON -- behandles som tom, ikke en krasj.
    return { answers: {}, continuedToFull: false };
  }
}

export function saveAnswers(answers: AnswerMap, continuedToFull: boolean): void {
  if (typeof window === "undefined") return;
  const payload: StoredPayload = {
    version: STORAGE_VERSION,
    answers,
    continuedToFull,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // F.eks. privat nettlesing uten lagringstilgang -- svelg feilen, ikke krasj appen.
  }
}

export function clearAnswers(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // se over
  }
}

function isValidStoredPayload(value: unknown): value is StoredPayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "number" &&
    typeof v.answers === "object" &&
    v.answers !== null
  );
}
