/**
 * Lokal lagring av testsvar i nettleseren. Testsvarene forlater ALDRI enheten
 * med mindre brukeren aktivt starter en AI-samtale (se Dokument 07 §2, §5).
 *
 * Krav (Dokument 09 §10.3, Dokument 03 §8):
 *  - Data skal avvises dersom format/versjon/item-sett ikke stemmer -- aldri
 *    stol ukritisk på lagrede data.
 *  - Systemet skal aldri krasje ved ugyldige lagrede data.
 */

import { ALL_QUESTIONS, OPTIONAL_O6_QUESTIONS } from "@/data/questions";
import { isValidAnswerValue, type AnswerMap, type FactorResult, type FacetResult } from "@/lib/scoring";
import { isValidFactorResult, isValidFacetResult } from "@/lib/account/validate";

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

/**
 * O6-tilleggsseksjonen (se questions.ts) lagres i EGET localStorage-felt,
 * atskilt fra hovedtesten -- slik at samtykke og data for denne (særlige
 * kategori-data etter GDPR art. 9) kan trekkes tilbake/slettes helt
 * uavhengig av resten av testresultatet (art. 9(2)(a) krever nettopp dette).
 */
const O6_STORAGE_KEY = "femfaktorer.o6tillegg.v1";
const O6_STORAGE_VERSION = 1;

export type O6ConsentStatus = "not_asked" | "declined" | "consented";

interface StoredO6Payload {
  version: number;
  status: O6ConsentStatus;
  answers: AnswerMap;
}

const o6QuestionIds = new Set(OPTIONAL_O6_QUESTIONS.map((q) => q.id));

export function loadO6(): { status: O6ConsentStatus; answers: AnswerMap } {
  if (typeof window === "undefined") return { status: "not_asked", answers: {} };
  try {
    const raw = window.localStorage.getItem(O6_STORAGE_KEY);
    if (!raw) return { status: "not_asked", answers: {} };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { status: "not_asked", answers: {} };
    const v = parsed as Record<string, unknown>;
    if (v.version !== O6_STORAGE_VERSION) return { status: "not_asked", answers: {} };
    const status: O6ConsentStatus =
      v.status === "consented" || v.status === "declined" ? v.status : "not_asked";
    const answers: AnswerMap = {};
    if (typeof v.answers === "object" && v.answers !== null) {
      for (const [id, value] of Object.entries(v.answers as Record<string, unknown>)) {
        if (o6QuestionIds.has(id) && isValidAnswerValue(value)) answers[id] = value;
      }
    }
    return { status, answers };
  } catch {
    return { status: "not_asked", answers: {} };
  }
}

export function saveO6(status: O6ConsentStatus, answers: AnswerMap): void {
  if (typeof window === "undefined") return;
  const payload: StoredO6Payload = { version: O6_STORAGE_VERSION, status, answers };
  try {
    window.localStorage.setItem(O6_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // se over
  }
}

/** Sletter O6-samtykke og -svar UAVHENGIG av resten av testresultatet. */
export function clearO6(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(O6_STORAGE_KEY);
  } catch {
    // se over
  }
}

/**
 * Resultat HENTET FRA KONTOEN (v2.4, se lib/account/*.ts og /logg-inn) --
 * brukt når noen logger inn på en ny enhet/nettleser og henter fram et
 * tidligere lagret fullversjon-resultat. Dette er BEVISST atskilt fra
 * `femfaktorer.korttest.v1` (som inneholder rå svar): kontoen lagrer kun
 * FERDIG BEREGNEDE skårer (se lib/account/blobs.ts), så det finnes ingen rå
 * svar å legge inn i det vanlige svarkartet. resultat/page.tsx sjekker denne
 * lagringen FØRST, og bruker den direkte uten å gå via computeTestResult().
 */
const RESTORED_STORAGE_KEY = "femfaktorer.hentetresultat.v1";
const RESTORED_STORAGE_VERSION = 1;

export interface RestoredAccountResult {
  factors: FactorResult[];
  facets: FacetResult[];
  o6Score: number | null;
  savedAt: string;
}

export function saveRestoredAccountResult(result: RestoredAccountResult): void {
  if (typeof window === "undefined") return;
  const payload = { version: RESTORED_STORAGE_VERSION, ...result };
  try {
    window.localStorage.setItem(RESTORED_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // se over
  }
}

export function loadRestoredAccountResult(): RestoredAccountResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RESTORED_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const v = parsed as Record<string, unknown>;
    if (v.version !== RESTORED_STORAGE_VERSION) return null;
    if (!Array.isArray(v.factors) || !v.factors.every(isValidFactorResult)) return null;
    if (!Array.isArray(v.facets) || !v.facets.every(isValidFacetResult)) return null;
    if (typeof v.savedAt !== "string") return null;
    const o6Score = typeof v.o6Score === "number" ? v.o6Score : null;
    return { factors: v.factors, facets: v.facets, o6Score, savedAt: v.savedAt };
  } catch {
    return null;
  }
}

export function clearRestoredAccountResult(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RESTORED_STORAGE_KEY);
  } catch {
    // se over
  }
}

/**
 * Aldersbekreftelse (v2.6, Dokument 07 §8: "enkel, synlig aldersbekreftelse
 * fremfor teknisk alderskontroll"). Selvdeklarert, ikke en reell alderssjekk
 * -- lagres lokalt slik at brukeren bare trenger å bekrefte én gang, ikke
 * ved hvert testforsøk.
 */
const AGE_CONFIRMED_STORAGE_KEY = "femfaktorer.aldersbekreftelse.v1";

export function loadAgeConfirmed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(AGE_CONFIRMED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveAgeConfirmed(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AGE_CONFIRMED_STORAGE_KEY, "true");
  } catch {
    // se over
  }
}
