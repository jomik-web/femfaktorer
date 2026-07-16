"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadAnswers, saveAnswers, loadO6, saveO6 } from "@/lib/storage";
import { buildAnswerSetCsv, parseAnswerSetCsv } from "@/lib/devTools/answerSetCsv";

export interface AnswerSetCsvPanelProps {
  /**
   * "reload" -- brukes når panelet vises PÅ /resultat selv: siden må
   * hydrere helt på nytt for å plukke opp et nettopp importert svarsett,
   * siden en navigasjon til samme rute ikke kjører hydreringen på nytt.
   * "navigate" -- brukes fra andre sider (f.eks. /verktoy/svardata), der en
   * vanlig ruteovergang til /resultat er nok.
   */
  afterImport?: "reload" | "navigate";
  /** Skjul nedlastingsknappen -- til bruk der det ikke finnes noe fullført resultat å laste ned ennå. */
  hideDownload?: boolean;
}

/**
 * Sant KUN på ekte iPhone/iPad (iOS/iPadOS) -- IKKE på Mac. iPadOS 13+
 * utgir seg for å være Mac i userAgent, derfor det ekstra touch-sjekket
 * (ekte Mac-er har ikke maxTouchPoints > 1). Nødvendig fordi Web Share API
 * finnes på BÅDE iOS og desktop Safari/macOS -- uten dette sjekket ville
 * Mac-brukere også få dele-arket i stedet for en vanlig nedlasting (se
 * feilrapport 16.07.2026: nedlastingen "forsvant" bak et Airdrop/dele-ark
 * på Mac etter forrige fiks, som kun skulle gjelde iPhone/iPad).
 */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPod|iPad/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * Delt last ned/last opp-panel for CSV-svarsett (v2.16, 15.07.2026).
 * Selve bygge-/parselogikken ligger i lib/devTools/answerSetCsv.ts og er
 * uavhengig av UI -- se den filens doc-kommentar for formatdetaljer.
 * Brukt både av den skjulte utviklersiden (/verktoy/svardata) og av de
 * synlige betatest-knappene på /resultat.
 */
export function AnswerSetCsvPanel({ afterImport = "navigate", hideDownload = false }: AnswerSetCsvPanelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedInfo, setImportedInfo] = useState<string | null>(null);

  async function handleDownload() {
    const stored = loadAnswers();
    const storedO6 = loadO6();
    const csv = buildAnswerSetCsv({
      tier: stored.tier,
      answers: stored.answers,
      o6Status: storedO6.status,
      o6Answers: storedO6.answers,
    });
    const date = new Date().toISOString().slice(0, 10);
    const filename = `femfaktorer-svardata-${stored.tier}-${date}.csv`;
    // BOM (﻿) foran innholdet -- gjør at norsk-språklig Excel tolker
    // filen som UTF-8 med én gang, slik at æøå vises riktig.
    const content = "﻿" + csv;

    // iPhone/iPad Safari støtter IKKE <a download> pålitelig for blob-URL-er
    // -- i stedet for å faktisk laste ned filen, åpner den bare innholdet
    // som en vanlig tekstside. Web Share API gir en ordentlig "Lagre til
    // Filer"-dialog på iOS -- men KUN der, se isIOS() over. Vanlig Mac
    // Safari (og andre desktop-nettlesere) har også Web Share API, men der
    // fungerer <a download> helt fint fra før -- så vi bruker delingsarket
    // KUN på ekte iPhone/iPad, ikke på Mac, for å unngå å legge en unødig
    // dele-dialog i veien for en helt vanlig nedlasting.
    if (
      isIOS() &&
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function"
    ) {
      try {
        const file = new File([content], filename, { type: "text/csv" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          return;
        }
      } catch (err) {
        // Brukeren avbrøt delingen selv -- ikke vis noen feilmelding, bare la det være.
        if (err instanceof Error && err.name === "AbortError") return;
        // Annen, uventet feil -- fortsett til den vanlige nedlastingen under som fallback.
      }
    }

    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setWarnings([]);
    setImportedInfo(null);
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = parseAnswerSetCsv(text);
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      saveAnswers(parsed.result.answers, parsed.result.tier);
      if (Object.keys(parsed.result.o6Answers).length > 0) {
        saveO6(parsed.result.o6Status, parsed.result.o6Answers);
      }
      setWarnings(parsed.result.warnings);
      setImportedInfo(`Lastet inn som "${parsed.result.tier}"-versjonen. Viser resultatet …`);
      const delay = parsed.result.warnings.length > 0 ? 1800 : 400;
      setTimeout(() => {
        if (afterImport === "reload") window.location.reload();
        else router.push("/resultat");
      }, delay);
    } catch {
      setError("Klarte ikke å lese filen. Er det en CSV-fil lastet ned herfra?");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {!hideDownload && (
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-teal px-5 py-2.5 text-center font-medium text-white"
          >
            Last ned svarene som CSV
          </button>
        )}
        <label className="cursor-pointer rounded-lg border border-teal px-5 py-2.5 text-center font-medium text-teal">
          {importing ? "Laster inn …" : "Last opp et svarsett"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={importing}
            className="hidden"
          />
        </label>
      </div>
      {importedInfo && <p className="text-sm text-teal">{importedInfo}</p>}
      {warnings.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm text-ink/70 dark:text-warmgray/70">
          {warnings.map((w, i) => (
            <li key={i}>-- {w}</li>
          ))}
        </ul>
      )}
      {error && <p className="text-sm text-coral">{error}</p>}
    </div>
  );
}
