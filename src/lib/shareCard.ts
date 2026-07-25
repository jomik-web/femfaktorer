/**
 * Delbart Spir-motiv-kort (v2.37, produkteiers ønske 25.07.2026, forenklet
 * 25.07.2026 etter produkteiers tilbakemelding): rene hjelpefunksjoner for
 * å rasterisere en av kort-SVG-ene (bygget i components/ShareCard.tsx) til
 * en ekte PNG-fil i NETTLESEREN, og for å dele/laste den ned. INGEN av
 * dette går via en server -- bildet lages og lever kun i brukerens egen
 * nettleser/minne, akkurat slik produkteier ba om ("ikke laste opp
 * innlogging og annen personlig informasjon").
 *
 * Kun ÉN delingsvei nå: selve BILDET (med faktormotiv + tagline), enten
 * via nettleserens/mobilens NATIVE deleark (Web Share API, `navigator.share`
 * med en `File`) eller ved nedlasting som reserveløsning der Web Share med
 * filer ikke støttes (typisk desktop). Instagram og Snapchat har ingen
 * offentlig lenke-basert "del med bilde ferdig utfylt" -- kun native
 * deleark fungerer dit, og kun på mobil.
 *
 * En tidligere versjon hadde i tillegg en rad med lenker til X/Facebook/
 * WhatsApp/LinkedIn/e-post (ren tekst+lenke til nettsiden, ikke bildet).
 * Fjernet 25.07.2026: research viser at slike knapperader i praksis nesten
 * aldri brukes (CSS-Tricks' leserundersøkelse: 60% klikker aldri på dem;
 * de utgjør under 0,3% av trafikken de fleste steder de er målt), og de
 * delte dessuten feil ting -- en lenke til testen, ikke det personlige
 * resultatbildet. Spotify Wrapped og Duolingo (som begge har lykkes godt
 * med akkurat denne typen deling) satser i stedet alt på étt ferdig,
 * vakkert bilde + én tydelig del-knapp.
 */

export type ShareFormat = "square" | "story";

export interface ShareFormatSpec {
  width: number;
  height: number;
  /** Kort norsk navn vist i formatvelgeren. */
  label: string;
  /** Hvilke plattformer/bruksområder formatet er tilpasset -- vist som hjelpetekst. */
  platforms: string;
  filename: string;
}

export const SHARE_FORMATS: Record<ShareFormat, ShareFormatSpec> = {
  square: {
    width: 1080,
    height: 1080,
    label: "Firkant",
    platforms: "Instagram- og Facebook-feed",
    filename: "dine-fasetter-resultat-firkant.png",
  },
  story: {
    width: 1080,
    height: 1920,
    label: "Story",
    platforms: "Instagram/Snapchat/Facebook-story",
    filename: "dine-fasetter-resultat-story.png",
  },
};

/** Tekst som følger med når bildet deles via native deleark (f.eks. forhåndsutfylt i Meldinger/e-post). */
export const GENERIC_SHARE_TEXT =
  "Jeg tok den norske personlighetstesten Dine Fasetter -- prøv den du også:";

/**
 * Serialiserer et allerede rendret `<svg>`-element til en PNG-Blob, i
 * angitt pikselbredde/-høyde (SVG-ens egen viewBox skaleres opp til dette,
 * for et skarpt bilde egnet til deling -- ikke bare skjermoppløsning).
 * Kjører KUN i nettleseren (bruker `document`/`Image`/`canvas`).
 */
export async function svgElementToPngBlob(
  svg: SVGSVGElement,
  widthPx: number,
  heightPx: number
): Promise<Blob> {
  const serialized = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Klarte ikke å laste SVG-en som bilde."));
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Fikk ikke tegnekontekst for canvas.");
    ctx.drawImage(img, 0, 0, widthPx, heightPx);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Klarte ikke å generere PNG fra kortet.");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Laster ned en blob som fil -- vanlig, brukerinitiert nedlasting, ingen opplasting noe sted. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Liten forsinkelse før opprydding -- noen nettlesere trenger at lenken
  // fortsatt er gyldig et kort øyeblikk etter klikket.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Feature-detect: kan denne nettleseren dele en faktisk BILDEFIL via native deleark? */
export function canShareFiles(file: File): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}

/**
 * Deler bildet via native deleark (mobil: åpner OS-ens app-velger --
 * Instagram, Snapchat, Meldinger, osv., avhengig av hva som er installert).
 * Returnerer `true` hvis native del faktisk ble forsøkt (kalleren skal da
 * IKKE også vise en nedlastingsknapp-handling i tillegg), `false` hvis
 * nettleseren ikke støtter det (kalleren bør falle tilbake til nedlasting).
 */
export async function shareImageFile(
  blob: Blob,
  filename: string,
  shareText: string
): Promise<boolean> {
  const file = new File([blob], filename, { type: "image/png" });
  if (!canShareFiles(file)) return false;
  try {
    await navigator.share({ files: [file], text: shareText });
    return true;
  } catch (err) {
    // Brukeren avbrøt deleark-valget -- ikke en feil, bare ikke fall videre til nedlasting.
    if (err instanceof Error && err.name === "AbortError") return true;
    return false;
  }
}
