/**
 * Lokal lagring av testsvar i nettleseren. Testsvarene forlater ALDRI enheten
 * med mindre brukeren aktivt starter en AI-samtale (se Dokument 07 §2, §5).
 *
 * Krav (Dokument 09 §10.3, Dokument 03 §8):
 *  - Data skal avvises dersom format/versjon/item-sett ikke stemmer -- aldri
 *    stol ukritisk på lagrede data.
 *  - Systemet skal aldri krasje ved ugyldige lagrede data.
 */

import { QUESTIONS } from "@/data/questions";
import { isValidAnswerValue, type AnswerMap } from "@/lib/scoring";

const STORAGE_KEY = "femfaktorer.korttest.v1";
// Bump denne ved enhver endring i spørsmålssett eller svarformat.
const STORAGE_VERSION = 1;

interface StoredPayload {
  version: number;
  questionIds: string[];
  answers: AnswerMap;
  updatedAt: string;
}

const currentQuestionIds = QUESTIONS.map((q) => q.id);

export function loadAnswers(): AnswerMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isValidStoredPayload(parsed)) return {};
    if (parsed.version !== STORAGE_VERSION) return {};
    if (!sameQuestionSet(parsed.questionIds)) return {};

    const cleaned: AnswerMap = {};
    for (const [id, value] of Object.entries(parsed.answers)) {
      if (currentQuestionIds.includes(id) && isValidAnswerValue(value)) {
        cleaned[id] = value;
      }
    }
    return cleaned;
  } catch {
    // Ugyldig/korrupt JSON -- behandles som tom, ikke en krasj.
    return {};
  }
}

export function saveAnswers(answers: AnswerMap): void {
  if (typeof window === "undefined") return;
  const payload: StoredPayload = {
    version: STORAGE_VERSION,
    questionIds: currentQuestionIds,
    answers,
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
    Array.isArray(v.questionIds) &&
    typeof v.answers === "object" &&
    v.answers !== null
  );
}

function sameQuestionSet(ids: string[]): boolean {
  if (ids.length !== currentQuestionIds.length) return false;
  const a = [...ids].sort();
  const b = [...currentQuestionIds].sort();
  return a.every((id, i) => id === b[i]);
}
