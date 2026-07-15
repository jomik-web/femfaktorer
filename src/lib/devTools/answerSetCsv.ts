/**
 * Eksport/import av et helt svarsett som CSV (v1, 15.07.2026).
 *
 * FORMÅL (produkteiers ønske): la produkteier lage ett eller flere FASTE
 * svarsett (f.eks. "typisk ekstrovert profil", "typisk høy N") som kan
 * lagres utenfor nettleseren og lastes inn igjen senere -- for å teste
 * rapporttekst og Spir-samtale mot et kjent, uforandret svarsett mens
 * resten av tjenesten (rapportlogikk, KI-respons) fortsatt er under
 * utvikling. Svarene selv er ment å være statiske; det er rapporten og
 * samtalen med KI som er utviklingsarbeidet, ikke svarene.
 *
 * Filen er en vanlig CSV (semikolon-skilt -- det norsk-språklig Excel
 * forventer som listeskilletegn -- og UTF-8 med BOM slik at æøå vises
 * riktig). Den kan redigeres for hånd: endre tallene i "svar"-kolonnen
 * (1-5, tomt = ubesvart) for å bygge et helt nytt, oppdiktet svarsett fra
 * bunnen av -- ikke bare til å ta vare på et allerede fullført forsøk.
 *
 * Denne funksjonaliteten er BEVISST ikke lenket fra vanlig navigasjon (se
 * /verktoy/svardata) -- den er ment for produkteier/utvikling, ikke for
 * vanlige brukere av tjenesten.
 *
 * TIER VED IMPORT bestemmes ikke av metadata-linjen i filen, men av hvor
 * mange svar som FAKTISK er fylt ut (alle 290 -> extended, alle 120 -> full,
 * alle 50 -> free) -- det gjør formatet robust mot at noen glemmer å
 * oppdatere metadata-linjen etter å ha redigert svarene for hånd.
 */

import {
  ALL_QUESTIONS,
  ALL_QUESTIONS_EXTENDED,
  FREE_QUESTIONS,
  OPTIONAL_O6_QUESTIONS,
  type Domain,
} from "@/data/questions";
import { isValidAnswerValue, type AnswerMap, type AnswerValue, type ResultTier } from "@/lib/scoring";
import type { O6ConsentStatus } from "@/lib/storage";

const FORMAT_MARKER = "femfaktorer-svardata";
const FORMAT_VERSION = 1;
const DELIMITER = ";";

interface CsvRow {
  id: string;
  section: "hovedtest" | "o6";
  order: number;
  domain: Domain | "O6";
  facet: string;
  facetName: string;
  textNo: string;
}

const HOVEDTEST_ROWS: CsvRow[] = ALL_QUESTIONS_EXTENDED.map((q) => ({
  id: q.id,
  section: "hovedtest",
  order: q.order,
  domain: q.domain,
  facet: q.facet,
  facetName: q.facetName,
  textNo: q.textNo,
}));

const O6_ROWS: CsvRow[] = OPTIONAL_O6_QUESTIONS.map((q, i) => ({
  id: q.id,
  section: "o6",
  order: i + 1,
  domain: "O6",
  facet: q.facet,
  facetName: q.facetName,
  textNo: q.textNo,
}));

const ALL_ROWS: CsvRow[] = [...HOVEDTEST_ROWS, ...O6_ROWS];

const HEADER = ["id", "section", "order", "domain", "facet", "facetName", "textNo", "svar"] as const;

const HOVEDTEST_IDS = new Set(HOVEDTEST_ROWS.map((r) => r.id));
const O6_IDS = new Set(O6_ROWS.map((r) => r.id));
const FULL_IDS = new Set(ALL_QUESTIONS.map((q) => q.id));
const FREE_IDS = new Set(FREE_QUESTIONS.map((q) => q.id));
const EXTENDED_IDS = new Set(ALL_QUESTIONS_EXTENDED.map((q) => q.id));

function csvEscape(value: string): string {
  if (value.includes(DELIMITER) || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export interface BuildAnswerSetCsvInput {
  tier: ResultTier;
  answers: AnswerMap;
  o6Status: O6ConsentStatus;
  o6Answers: AnswerMap;
}

/** Bygger selve CSV-teksten (uten BOM -- BOM legges til av nedlastingskoden, se page.tsx). */
export function buildAnswerSetCsv(input: BuildAnswerSetCsvInput): string {
  const lines: string[] = [];
  lines.push(`# ${FORMAT_MARKER} v${FORMAT_VERSION}`);
  lines.push(`# tier=${input.tier}`);
  lines.push(`# o6_status=${input.o6Status}`);
  lines.push(HEADER.join(DELIMITER));
  for (const row of ALL_ROWS) {
    const svar = row.section === "hovedtest" ? input.answers[row.id] : input.o6Answers[row.id];
    const cells = [
      row.id,
      row.section,
      String(row.order),
      row.domain,
      row.facet,
      row.facetName,
      row.textNo,
      svar !== undefined && svar !== null ? String(svar) : "",
    ];
    lines.push(cells.map(csvEscape).join(DELIMITER));
  }
  return lines.join("\r\n");
}

/** Enkel RFC4180-aktig CSV-tokenizer -- håndterer anførselstegn og innebygde linjeskift i felt. */
function splitCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === delimiter) {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export interface ParsedAnswerSet {
  tier: ResultTier;
  answers: AnswerMap;
  o6Status: O6ConsentStatus;
  o6Answers: AnswerMap;
  warnings: string[];
}

export type ParseAnswerSetResult = { ok: true; result: ParsedAnswerSet } | { ok: false; error: string };

export function parseAnswerSetCsv(raw: string): ParseAnswerSetResult {
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  // \r\n og \r alene normaliseres til \n FØR CSV-tokenisering -- selve
  // tokenizeren håndterer bare \n som radskille (og bevarer \n inni anførselstegn).
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = normalized.split("\n");
  const metaLines = rawLines.filter((l) => l.trim().startsWith("#"));
  const bodyText = rawLines.filter((l) => !l.trim().startsWith("#")).join("\n");

  const meta: Record<string, string> = {};
  for (const l of metaLines) {
    const m = l.replace(/^#\s*/, "");
    const eq = m.indexOf("=");
    if (eq > -1) meta[m.slice(0, eq).trim()] = m.slice(eq + 1).trim();
  }

  const firstLine = bodyText.split("\n").find((l) => l.trim().length > 0);
  if (!firstLine) return { ok: false, error: "Fant ingen data i filen." };
  const semiCount = (firstLine.match(/;/g) ?? []).length;
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const delimiter = semiCount >= commaCount ? ";" : ",";

  const rows = splitCsv(bodyText, delimiter).filter((r) => r.some((c) => c.trim().length > 0));
  if (rows.length === 0) return { ok: false, error: "Fant ingen data i filen." };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idCol = header.indexOf("id");
  const sectionCol = header.indexOf("section");
  const svarCol = header.indexOf("svar");
  if (idCol === -1 || svarCol === -1) {
    return {
      ok: false,
      error: 'Filen mangler forventede kolonner ("id" og "svar"). Er dette riktig fil -- lastet ned fra denne siden?',
    };
  }

  const answers: AnswerMap = {};
  const o6Answers: AnswerMap = {};
  const unknownIds: string[] = [];
  const invalidValues: string[] = [];

  for (const r of rows.slice(1)) {
    const id = (r[idCol] ?? "").trim();
    if (!id) continue;
    const svarRaw = (r[svarCol] ?? "").trim();
    const sectionValue = sectionCol > -1 ? r[sectionCol]?.trim() : undefined;
    const isO6 = sectionValue ? sectionValue === "o6" : O6_IDS.has(id);

    if (isO6 && !O6_IDS.has(id)) {
      unknownIds.push(id);
      continue;
    }
    if (!isO6 && !HOVEDTEST_IDS.has(id)) {
      unknownIds.push(id);
      continue;
    }
    if (svarRaw === "") continue;

    const num = Number(svarRaw);
    if (!isValidAnswerValue(num)) {
      invalidValues.push(`${id}=${svarRaw}`);
      continue;
    }
    if (isO6) o6Answers[id] = num as AnswerValue;
    else answers[id] = num as AnswerValue;
  }

  const warnings: string[] = [];
  if (unknownIds.length > 0) {
    warnings.push(
      `${unknownIds.length} ukjent(e) spørsmåls-id ble hoppet over (f.eks. ${unknownIds.slice(0, 3).join(", ")}).`
    );
  }
  if (invalidValues.length > 0) {
    warnings.push(
      `${invalidValues.length} ugyldig(e) svarverdi ble hoppet over (må være et heltall 1-5). Eksempel: ${invalidValues
        .slice(0, 3)
        .join(", ")}.`
    );
  }

  const extendedComplete = [...EXTENDED_IDS].every((id) => answers[id] !== undefined);
  const fullComplete = [...FULL_IDS].every((id) => answers[id] !== undefined);
  const freeComplete = [...FREE_IDS].every((id) => answers[id] !== undefined);

  let tier: ResultTier;
  if (extendedComplete) tier = "extended";
  else if (fullComplete) tier = "full";
  else if (freeComplete) tier = "free";
  else {
    const freeMissing = [...FREE_IDS].filter((id) => answers[id] === undefined).length;
    return {
      ok: false,
      error: `Svarsettet er ufullstendig -- mangler ${freeMissing} av ${FREE_IDS.size} svar for i det minste kortversjonen (${FREE_IDS.size} spørsmål). Fyll ut "svar"-kolonnen (1-5) for radene du vil ha med i "hovedtest"-delen, og last opp filen på nytt.`,
    };
  }

  if (meta.tier && meta.tier !== tier) {
    warnings.push(
      `Metadata i filen sa tier=${meta.tier}, men jeg brukte ${tier} basert på hvor mange svar som faktisk var fylt ut.`
    );
  }

  const o6Complete = O6_ROWS.every((r) => o6Answers[r.id] !== undefined);
  const o6HasAny = Object.keys(o6Answers).length > 0;
  if (o6HasAny && !o6Complete) {
    warnings.push(
      "O6-tilleggsspørsmålene var delvis utfylt og ble derfor hoppet over (alle fire må være besvart for at tilleggsseksjonen skal vises)."
    );
  }
  const o6Status: O6ConsentStatus = o6Complete ? "consented" : "not_asked";

  return {
    ok: true,
    result: { tier, answers, o6Status, o6Answers: o6Complete ? o6Answers : {}, warnings },
  };
}
