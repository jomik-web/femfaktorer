/**
 * Lokal lagring av testsvar i nettleseren. Testsvarene forlater ALDRI enheten
 * med mindre brukeren aktivt starter en AI-samtale (se Dokument 07 §2, §5).
 *
 * Krav (Dokument 09 §10.3, Dokument 03 §8):
 *  - Data skal avvises dersom format/versjon/item-sett ikke stemmer -- aldri
 *    stol ukritisk på lagrede data.
 *  - Systemet skal aldri krasje ved ugyldige lagrede data.
 */

import { ALL_QUESTIONS_EXTENDED, OPTIONAL_O6_QUESTIONS } from "@/data/questions";
import {
  isValidAnswerValue,
  type AnswerMap,
  type FactorResult,
  type FacetResult,
  type ResultTier,
} from "@/lib/scoring";
import { isValidFactorResult, isValidFacetResult } from "@/lib/account/validate";

const STORAGE_KEY = "femfaktorer.korttest.v1";
// Bump denne ved enhver endring i spørsmålssett eller svarformat.
// v2 (120-spørsmål-utvidelsen): et lagret svar er nå gyldig så lenge
// spørsmål-iden finnes i det GJELDENDE spørsmålssettet -- ikke bare hvis
// hele det lagrede settet er identisk med dagens. Dette gjør at en bruker
// som har stoppet ved 50 av 120 spørsmål ikke mister svarene sine bare fordi
// det lagrede settet er en delmengde av alle spørsmålene.
// v3 (290-spørsmål-utvidelsen, v2.11): `continuedToFull: boolean` erstattet
// med `tier: ResultTier`, som nå kan være "free" | "full" | "extended".
// Gamle v2-lagrede svar avvises rett og slett (samme prinsipp som v1->v2) --
// brukeren starter da bare på nytt fra begynnelsen, ingen migrering forsøkt.
const STORAGE_VERSION = 3;

interface StoredPayload {
  version: number;
  answers: AnswerMap;
  /** Hvor langt brukeren aktivt har valgt å fortsette: "free" er default/ikke lagret aktivt. */
  tier?: ResultTier;
  updatedAt: string;
}

function normalizeTier(value: unknown): ResultTier {
  return value === "full" || value === "extended" ? value : "free";
}

// Bruker det STØRSTE gyldige spørsmålssettet (290) som fasit for hvilke
// spørsmål-id-er som fortsatt regnes som gyldige -- det er en overmengde av
// både 50-, 120- og 290-settet, så et lagret svar for et hvilket som helst
// tier valideres korrekt uansett hvor langt brukeren har kommet.
const currentQuestionIds = new Set(ALL_QUESTIONS_EXTENDED.map((q) => q.id));

export function loadAnswers(): { answers: AnswerMap; tier: ResultTier } {
  if (typeof window === "undefined") return { answers: {}, tier: "free" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { answers: {}, tier: "free" };
    const parsed: unknown = JSON.parse(raw);
    if (!isValidStoredPayload(parsed)) return { answers: {}, tier: "free" };
    if (parsed.version !== STORAGE_VERSION) return { answers: {}, tier: "free" };

    const cleaned: AnswerMap = {};
    for (const [id, value] of Object.entries(parsed.answers)) {
      if (currentQuestionIds.has(id) && isValidAnswerValue(value)) {
        cleaned[id] = value;
      }
    }
    return { answers: cleaned, tier: normalizeTier(parsed.tier) };
  } catch {
    // Ugyldig/korrupt JSON -- behandles som tom, ikke en krasj.
    return { answers: {}, tier: "free" };
  }
}

export function saveAnswers(answers: AnswerMap, tier: ResultTier): void {
  if (typeof window === "undefined") return;
  const payload: StoredPayload = {
    version: STORAGE_VERSION,
    answers,
    tier,
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

/**
 * v2.25 (produkteiers ønske): når brukeren aktivt velger å ta testen på nytt
 * i stedet for å se resultatet sitt (se /test sin "Du har allerede et
 * resultat"-skjerm), skal ikke de forrige svarene bare forsvinne stille --
 * de arkiveres lokalt (siste 5 forsøk, eldste først ut) FØR de vanlige
 * svarene nullstilles av `clearAnswers()`. Ingen egen visning av arkivet er
 * bygget ennå -- det hører sammen med det planlagte arbeidet med flere
 * lagrede testresultater over tid (produkteiers nivå-/prisplan) -- men
 * dataene er teknisk sett ikke tapt, bare ikke tilgjengelige i grensesnittet
 * ennå.
 */
const ARCHIVE_STORAGE_KEY = "femfaktorer.arkiverte_svar.v1";
const ARCHIVE_VERSION = 1;
const ARCHIVE_MAX_ENTRIES = 5;

interface ArchivedAnswers {
  answers: AnswerMap;
  tier: ResultTier;
  archivedAt: string;
}

interface ArchivePayload {
  version: number;
  entries: ArchivedAnswers[];
}

function isValidArchivePayload(value: unknown): value is ArchivePayload {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.version === ARCHIVE_VERSION && Array.isArray(v.entries);
}

export function archiveCurrentAnswersBeforeRetake(): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadAnswers();
    if (Object.keys(current.answers).length === 0) return; // ingenting å arkivere ennå
    let entries: ArchivedAnswers[] = [];
    const raw = window.localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidArchivePayload(parsed)) entries = parsed.entries;
    }
    entries.push({ answers: current.answers, tier: current.tier, archivedAt: new Date().toISOString() });
    if (entries.length > ARCHIVE_MAX_ENTRIES) {
      entries = entries.slice(entries.length - ARCHIVE_MAX_ENTRIES);
    }
    const payload: ArchivePayload = { version: ARCHIVE_VERSION, entries };
    window.localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Arkivering er best-effort og skal ALDRI blokkere at brukeren kan starte
    // på nytt -- svelg feilen, akkurat som resten av lagringsfunksjonene her.
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
  /**
   * Hvilken testversjon resultatet er basert på (v2.11). Eldre lagrede
   * kontoresultater fra før dette feltet fantes, har ikke dette satt --
   * de behandles som "full" (den eneste tier-en som kunne lagres den gangen).
   */
  tier: Extract<ResultTier, "full" | "extended">;
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
    const tier = v.tier === "extended" ? "extended" : "full";
    return { factors: v.factors, facets: v.facets, o6Score, savedAt: v.savedAt, tier };
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
