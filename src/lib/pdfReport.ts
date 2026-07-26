import { jsPDF, GState } from "jspdf";
import type { Domain } from "@/data/questions";
import type { DisplayFactor, FactorResult, FacetResult, ResultTier } from "@/lib/scoring";
import { DOMAIN_TO_DISPLAY } from "@/lib/scoring";
import { INTERPRETATIONS, DOMAIN_DEFINITIONS, NON_DIAGNOSTIC_NOTICE, CRISIS_NOTICE, bandFor } from "@/data/interpretations";
import { FACET_INTERPRETATIONS, FACET_ORDER_BY_DOMAIN, facetInterpretationFor } from "@/data/facetInterpretations";

/**
 * v2.37 (produkteiers ønske 26.07.2026, kvalitetssammenligning mot en
 * konkurrent-PDF): reverserer DOMAIN_TO_DISPLAY (samme mønster som
 * DISPLAY_TO_DOMAIN i resultat/page.tsx) -- trengs for å finne underkategori-
 * ene som hører til EN gitt hovedkategori, se fiksen lenger ned.
 */
const DISPLAY_TO_DOMAIN: Record<DisplayFactor, Domain> = Object.fromEntries(
  (Object.entries(DOMAIN_TO_DISPLAY) as [Domain, DisplayFactor][]).map(([domain, display]) => [display, domain])
) as Record<DisplayFactor, Domain>;

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

  // v2.37: `thin` brukes for underkategori-stolpene -- litt lavere enn
  // hoveddomene-stolpene, slik at det visuelt er tydelig hva som er
  // hovedkategori og hva som er underkategori, samtidig som underkategoriene
  // (som tidligere ikke hadde NOEN visuell indikator, bare "Navn -- XX/100"
  // som ren tekst) nå får samme type stolpe å skanne visuelt.
  function scoreBar(score: number, color: [number, number, number], thin = false) {
    const height = thin ? 2.2 : 3.2;
    ensureSpace(height + 2.8);
    const clamped = Math.min(100, Math.max(0, score));
    doc.setFillColor(...TRACK_RGB);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, height, height / 2, height / 2, "F");
    if (clamped > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(MARGIN, y, (CONTENT_WIDTH * clamped) / 100, height, height / 2, height / 2, "F");
    }
    y += thin ? 5 : 7;
  }

  /**
   * v2.37: kompakt pentagon-/radardiagram over de fem hovedfaktorene --
   * lagt til etter kvalitetssammenligningen mot en konkurrent-PDF (som IKKE
   * hadde noen diagrammer -- den er typebasert, ikke skårbasert). Dette er
   * nettopp den typen visualisering en konkurrent uten skårdata ikke kan
   * tilby, og spiller derfor på det Dine Fasetter faktisk er god på
   * (presise tall), i stedet for å kopiere en ren tekst-stil. Tegnet med
   * jsPDF sine vektor-primitiver (rene linjer/polygoner), ikke et bilde.
   */
  function drawFactorRadar(factors: FactorResult[]) {
    const maxRadius = 26;
    const chartHeight = maxRadius * 2 + 22;
    ensureSpace(chartHeight);
    const cx = MARGIN + CONTENT_WIDTH / 2;
    const topY = y;
    const cy = topY + maxRadius + 6;
    const count = factors.length;

    const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / count;
    const vertex = (radius: number, i: number): [number, number] => {
      const angle = angleFor(i);
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    };
    const drawClosedPath = (points: [number, number][], style: string) => {
      const start = points[0];
      if (!start) return;
      const deltas = points.slice(1).map((p, idx) => {
        const prev = points[idx]!;
        return [p[0] - prev[0], p[1] - prev[1]];
      });
      doc.lines(deltas, start[0], start[1], [1, 1], style, true);
    };

    // Referanseringer (25/50/75/100 %) -- rent visuelt rutenett.
    doc.setDrawColor(...TRACK_RGB);
    doc.setLineWidth(0.25);
    for (const frac of [0.25, 0.5, 0.75, 1]) {
      drawClosedPath(
        factors.map((_, i) => vertex(maxRadius * frac, i)),
        "S"
      );
    }

    // Akselinjer fra midtpunktet ut til hvert hjørne.
    factors.forEach((_, i) => {
      const [vx, vy] = vertex(maxRadius, i);
      doc.line(cx, cy, vx, vy);
    });

    // Selve datapolygonet -- lett gjennomsiktig fyll + solid kontur i indigo.
    const dataPoints = factors.map((f, i) => vertex((maxRadius * Math.min(100, Math.max(0, f.score))) / 100, i));
    doc.saveGraphicsState();
    doc.setGState(new GState({ opacity: 0.18 }));
    doc.setFillColor(...INDIGO_RGB);
    drawClosedPath(dataPoints, "F");
    doc.restoreGraphicsState();
    doc.setDrawColor(...INDIGO_RGB);
    doc.setLineWidth(0.6);
    drawClosedPath(dataPoints, "S");

    // Fargede punkter per faktor, pluss etiketter og tall utenfor ringen.
    factors.forEach((f, i) => {
      const [vx, vy] = vertex((maxRadius * Math.min(100, Math.max(0, f.score))) / 100, i);
      doc.setFillColor(...FACTOR_RGB[f.factor]);
      doc.circle(vx, vy, 1.3, "F");

      const [lx, ly] = vertex(maxRadius + 10, i);
      const align: "left" | "center" | "right" = lx < cx - 2 ? "right" : lx > cx + 2 ? "left" : "center";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...INDIGO_RGB);
      doc.text(f.label, lx, ly, { align });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY_RGB);
      doc.text(`${Math.round(f.score)}/100`, lx, ly + 4, { align });
    });

    y = topY + chartHeight;
  }

  // ---------- Forside ----------
  // v2.37 (kvalitetssammenligning mot en konkurrent-PDF, 26.07.2026): den
  // hadde forside, innholdsoversikt og avslutning -- denne rapporten hoppet
  // rett til innholdet uten noen av delene. Fargestripen bruker de samme
  // fem faktorfargene som stolpene ellers i rapporten -- en visuell
  // "signatur" som faktisk er egen for Dine Fasetter (data-drevet), i
  // stedet for å prøve å kopiere en illustrert forside vi ikke har
  // designressurser til å lage skikkelig.
  const tierLabel =
    input.tier === "extended" ? "Utvidet versjon (290 spørsmål)" : input.tier === "full" ? "Fullversjon (120 spørsmål)" : "Foreløpig resultat (50 spørsmål)";
  const generatedDate = new Date().toLocaleDateString("no-NO");

  const stripeColors = Object.values(FACTOR_RGB);
  const stripeWidth = PAGE_WIDTH / stripeColors.length;
  stripeColors.forEach((color, i) => {
    doc.setFillColor(...color);
    doc.rect(i * stripeWidth, 0, stripeWidth + 0.5, 12, "F");
  });

  doc.setTextColor(...GRAY_RGB);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Dine Fasetter", MARGIN, 45);

  doc.setTextColor(...INDIGO_RGB);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text("Din profil", MARGIN, 60);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...GRAY_RGB);
  doc.text(`${tierLabel} -- generert ${generatedDate}`, MARGIN, 70);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Basert utelukkende på dine egne svar -- ikke en fasit, men et bilde av tendenser nå.", MARGIN, 85);

  doc.addPage();
  y = MARGIN;

  paragraph(NON_DIAGNOSTIC_NOTICE, 8.5, GRAY_RGB);
  paragraph(CRISIS_NOTICE, 8.5, GRAY_RGB);
  y += 4;

  // ---------- Profilen din i korte trekk (radardiagram) ----------
  ensureSpace(12);
  heading("Profilen din i korte trekk", 13);
  drawFactorRadar(input.factors);
  y += 4;

  // ---------- Hovedfaktorer (+ underkategorier gruppert under RIKTIG domene) ----------
  // v2.37: underkategoriene lå tidligere i én flat liste for ALLE domener,
  // samlet etter at samtlige fem hovedkategori-tekstene var skrevet ut --
  // uten domene-overskrifter innimellom, så det kun var selve innholdet som
  // avslørte at det byttet fra f.eks. Medmenneskelighet til Planmessighet.
  // Nettsiden (resultat/page.tsx) viser derimot hver hovedkategoris egne
  // underkategorier RETT UNDER den kategorien -- PDF-en har mistet den
  // grupperingen. Fikset ved å flytte underkategori-visningen inn i samme
  // løkke som hovedkategorien, filtrert på domenet (samme mønster som
  // `facetsForDomain` i resultat/page.tsx).
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

    if (input.tier !== "free" && input.facets.length > 0) {
      const domain = DISPLAY_TO_DOMAIN[f.factor];
      const order = FACET_ORDER_BY_DOMAIN[domain];
      const facetsForDomain = order
        .map((code) => input.facets.find((fa) => fa.facet === code))
        .filter((fa): fa is FacetResult => fa !== undefined);

      if (facetsForDomain.length > 0) {
        ensureSpace(10);
        heading("Underkategorier", 11.5);
        for (const fa of facetsForDomain) {
          ensureSpace(16);
          const meta = FACET_INTERPRETATIONS[fa.facet];
          doc.setTextColor(...INDIGO_RGB);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${meta?.label ?? fa.facet} -- ${Math.round(fa.score)}/100`, MARGIN, y);
          y += 4.5;
          scoreBar(fa.score, FACTOR_RGB[f.factor], true);
          paragraph(facetInterpretationFor(fa.facet, bandFor(fa.score)), 9);
        }
        y += 3;
      }
    }
  }

  // ---------- Oppsummering ----------
  if (input.closingText) {
    ensureSpace(14);
    heading("Hva betyr dette for deg?", 15);
    paragraph(input.closingText);
  }

  // ---------- Avslutningsside ----------
  // v2.37: rapporten stoppet tidligere brått rett etter oppsummeringen --
  // ingen avsluttende side, i motsetning til konkurrent-PDF-en som ble brukt
  // i sammenligningen (egen "Next steps"-side). Gjentar bevisst IKKE
  // CLOSING_LINE-setningen fra `closingText` ("Ingen deler av profilen din
  // er faste...") her -- den er allerede sagt der, og skal ikke dupliseres.
  doc.addPage();
  y = MARGIN;
  heading("Takk for at du tok deg tid", 16);
  paragraph(
    "Vil du utforske resultatet videre? Spir, vår AI-veileder, kan hjelpe deg å reflektere videre rundt funnene over -- eller ta testen på nytt lenger frem i tid for å se hvordan svarene dine har endret seg. Begge deler finner du på dinefasetter.no."
  );
  y += 4;
  paragraph(
    "Denne rapporten er generert til privat bruk, basert på svarene dine i Dine Fasetter, og bør ikke brukes som en offisiell eller klinisk vurdering av deg selv eller andre.",
    8.5,
    GRAY_RGB
  );

  // ---------- Bunntekst på alle sider unntatt forsiden ----------
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...TRACK_RGB);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_HEIGHT - 14, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 14);
    doc.setTextColor(...GRAY_RGB);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Dine Fasetter", MARGIN, PAGE_HEIGHT - 9);
    doc.text(`Side ${i - 1} av ${totalPages - 1}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 9, { align: "right" });
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
