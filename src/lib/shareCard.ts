/**
 * Delbart Spir-motiv-kort (v2.37, produkteiers ønske 25.07.2026): rene
 * hjelpefunksjoner for å rasterisere en av de tre kort-SVG-ene (bygget i
 * components/ShareCard.tsx) til en ekte PNG-fil i NETTLESEREN, og for å
 * dele/laste den ned. INGEN av dette går via en server -- bildet lages og
 * lever kun i brukerens egen nettleser/minne, akkurat slik produkteier ba
 * om ("ikke laste opp innlogging og annen personlig informasjon").
 *
 * Deling skjer på to bevisst atskilte måter:
 *  1. Selve BILDET (med faktormotiv + tagline) -- kun via nettleserens/
 *     mobilens NATIVE deleark (Web Share API, `navigator.share` med en
 *     `File`), siden det er den eneste metoden som kan legge ved en
 *     faktisk bildefil uten at brukeren må laste ned og lime inn selv.
 *     Instagram og Snapchat har INGEN offentlig lenke-basert "del med
 *     bilde ferdig utfylt" -- kun native deleark fungerer dit, og kun på
 *     mobil. Er ikke Web Share API med filer støttet (typisk desktop),
 *     faller vi tilbake til ren nedlasting -- brukeren limer selv inn
 *     bildet i appen sin.
 *  2. En generisk TEKST+LENKE tilbake til nettsiden, via vanlige
 *     plattform-URL-er (X, Facebook, WhatsApp, LinkedIn, e-post). Disse
 *     bærer BEVISST en generisk, ikke-personlig tekst (ikke selve
 *     tagline/resultatet) -- en ren lenkedeling er tekst i et innlegg, og
 *     vi ønsker ikke at et konkret personlighetstrekk skal limes inn i
 *     ren tekst uten den visuelle konteksten bildet gir.
 */

export type ShareFormat = "square" | "story" | "link";

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
  link: {
    width: 1200,
    height: 630,
    label: "Liggende",
    platforms: "Lenkedeling (X, Facebook, LinkedIn, e-post)",
    filename: "dine-fasetter-resultat-liggende.png",
  },
};

/** Generisk, upersonlig delingstekst -- se filhode for hvorfor denne bevisst ikke inneholder tagline/resultatet. */
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

/** Bygger lenke-baserte del-URL-er -- åpnes i ny fane, ingen av disse ber om innlogging fra oss. */
export function buildPlatformShareUrls(siteUrl: string, text: string = GENERIC_SHARE_TEXT) {
  const encodedUrl = encodeURIComponent(siteUrl);
  const encodedText = encodeURIComponent(text);
  return {
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent("Dine Fasetter -- personlighetstest")}&body=${encodedText}%20${encodedUrl}`,
  };
}
