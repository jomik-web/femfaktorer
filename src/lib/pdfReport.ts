import { jsPDF } from "jspdf";
import type { DisplayFactor, FactorResult, FacetResult, ResultTier } from "@/lib/scoring";
import { INTERPRETATIONS, DOMAIN_DEFINITIONS, NON_DIAGNOSTIC_NOTICE, CRISIS_NOTICE, bandFor } from "@/data/interpretations";
import { FACET_INTERPRETATIONS, facetInterpretationFor } from "@/data/facetInterpretations";

/**
 * Ekte PDF-eksport av resultatet (v2.28, 23.07.2026) -- erstatter den
 * gamle "Last ned som PDF"-knappen, som kalte window.print() og lente seg
 * på at nettleseren/OS-et hadde en "Skriv ut -> Lagre som PDF"-mulighet.
 * På mobil (spesielt iPhone uten en synlig PDF-skriver i utskriftsdialogen)
 * fungerte dette ikke i praksis -- brukeren ble bare sendt til en vanlig
 * utskriftsdialog uten noen måte å faktisk få en PDF-fil.
 *
 * Denne modulen bygger PDF-en direkte i nettleseren med jsPDF (ren
 * tekst/rektangel-tegning -- IKKE et skjermbilde av selve siden), og
 * tilbyr den til brukeren på to måter:
 *  - Vanlig nedlasting (doc.save()) -- fungerer overalt på desktop, og på
 *    Android/andre mobiler som støtter <a download> for blob-URL-er.
 *  - Web Share API (samme mønster som CSV-eksporten i
 *    AnswerSetCsvPanel.tsx) på ekte iPhone/iPad -- gir et ordentlig
 *    "Lagre til Filer"/del-ark, som er den pålitelige måten å faktisk få
 *    en lagret PDF-fil på iOS (Safari støtter ikke <a download> for
 *    blob-URL-er pålitelig).
 *
 * MERK: "jspdf" er en ny avhengighet (package.json) -- sandkassen som ble
 * brukt til å utvikle dette har ikke nettverkstilgang til npm-registeret,
 * så `npm install` må kjøres lokalt før dette kompilerer og kjører.
 */

const FACTOR_RGB: Record<DisplayFactor, [number, number, number]> = {
  openness: [139, 124, 232],
  conscientiousness: [65, 115, 230],
  extraversion: [255, 112, 51],
  agreeableness: [81, 214, 99],
  stability: [255, 107, 138],
};

const INDIGO_RGB: [number, number, number] = [20, 20, 43];
const GRAY_RGB: [number, number, number] = [110, 108, 120];
const TRACK_RGB: [number, number, number] = [233, 229, 245];

export interface ResultPdfInput {
  factors: FactorResult[];
  facets: FacetResult[];
  tier: ResultTier;
  /** Avsluttende profiloppsummering ("Hva betyr dette for deg?"), om noen. */
  closingText?: string | null;
}

/**
 * Sant KUN på ekte iPhone/iPad -- se identisk sjekk (med forklaring) i
 * AnswerSetCsvPanel.tsx.
 */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPod|iPad/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

const MARGIN = 18;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function buildDoc(input: ResultPdfInput): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  function ensureSpace(needed: number) {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function heading(text: string, size: number) {
    ensureSpace(size * 0.5 + 4);
    doc.setTextColor(...INDIGO_RGB);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.text(text, MARGIN, y);
    y += size * 0.5 + 2;
  }

  function paragraph(text: string, size = 10, color: [number, number, number] = INDIGO_RGB) {
    if (!text) return;
    doc.setTextColor(...color);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH) as string[];
    for (const line of lines) {
      ensureSpace(5.5);
      doc.text(line, MARGIN, y);
      y += 5;
    }
    y += 2;
  }

  function scoreBar(score: number, color: [number, number, number]) {
    ensureSpace(6);
    const clamped = Math.min(100, Math.max(0, score));
    doc.setFillColor(...TRACK_RGB);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 3.2, 1.6, 1.6, "F");
    if (clamped > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(MARGIN, y, (CONTENT_WIDTH * clamped) / 100, 3.2, 1.6, 1.6, "F");
    }
    y += 7;
  }

  // ---------- Tittel ----------
  heading("Din profil", 20);
  doc.setTextColor(...GRAY_RGB);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  const tierLabel =
    input.tier === "extended" ? "Utvidet versjon (290 spørsmål)" : input.tier === "full" ? "Fullversjon (120 spørsmål)" : "Foreløpig resultat (50 spørsmål)";
  doc.text(`Dine Fasetter -- ${tierLabel} -- generert ${new Date().toLocaleDateString("no-NO")}`, MARGIN, y);
  y += 8;

  paragraph(NON_DIAGNOSTIC_NOTICE, 8.5, GRAY_RGB);
  paragraph(CRISIS_NOTICE, 8.5, GRAY_RGB);
  y += 2;

  // ---------- Hovedfaktorer ----------
  for (const f of input.factors) {
    ensureSpace(16);
    heading(f.label, 14);
    paragraph(DOMAIN_DEFINITIONS[f.factor], 8.5, GRAY_RGB);
    doc.setTextColor(...INDIGO_RGB);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${Math.round(f.score)} / 100`, MARGIN, y);
    y += 5;
    scoreBar(f.score, FACTOR_RGB[f.factor]);

    const band = bandFor(f.score);
    const copy = INTERPRETATIONS[f.factor][band];
    if (copy.synthesis) {
      paragraph(copy.synthesis);
    } else {
      paragraph(copy.overview);
      paragraph(copy.nuance);
    }
    y += 3;
  }

  // ---------- Underkategorier (kun full/utvidet) ----------
  if (input.tier !== "free" && input.facets.length > 0) {
    ensureSpace(14);
    heading("Underkategorier", 15);
    for (const fa of input.facets) {
      ensureSpace(12);
      const meta = FACET_INTERPRETATIONS[fa.facet];
      doc.setTextColor(...INDIGO_RGB);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${meta?.label ?? fa.facet} -- ${Math.round(fa.score)}/100`, MARGIN, y);
      y += 5;
      paragraph(facetInterpretationFor(fa.facet, bandFor(fa.score)), 9);
    }
  }

  // ---------- Oppsummering ----------
  if (input.closingText) {
    ensureSpace(14);
    heading("Hva betyr dette for deg?", 15);
    paragraph(input.closingText);
  }

  return doc;
}

/**
 * Bygger PDF-en og tilbyr den til brukeren -- last ned direkte (desktop/
 * Android) eller via del-arket (ekte iPhone/iPad). Kalles fra en
 * klikk-handler (krever brukerinteraksjon for at navigator.share skal
 * fungere på iOS).
 */
export async function downloadResultPdf(input: ResultPdfInput): Promise<void> {
  const doc = buildDoc(input);
  const filename = `dine-fasetter-resultat-${new Date().toISOString().slice(0, 10)}.pdf`;

  if (
    isIOS() &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  ) {
    try {
      const blob = doc.output("blob");
      const file = new File([blob], filename, { type: "application/pdf" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (err) {
      // Brukeren avbrøt delingen selv -- ikke fall tilbake til vanlig
      // nedlasting da (den fungerer uansett ikke pålitelig på iOS Safari).
      if (err instanceof Error && err.name === "AbortError") return;
      // Annen, uventet feil -- prøv vanlig nedlasting som fallback under.
    }
  }

  doc.save(filename);
}
