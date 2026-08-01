import { NextResponse } from "next/server";
import { ALL_QUESTIONS, ALL_QUESTIONS_EXTENDED } from "@/data/questions";
import { QUESTION_SET_VERSION } from "@/data/questionSetVersion";
import { APP_VERSION } from "@/lib/version";
import { storeAnswerSet } from "@/lib/research/blobs";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  clampResponseMs,
  isoWeek,
  isValidResearchAnswerValue,
  isValidResearchDevice,
  type ResearchAnswerSet,
  type ResearchAnswerValue,
} from "@/lib/research/types";

export const runtime = "nodejs";

/**
 * Tar imot ett anonymt svarsett fra en fullført 120- eller 290-test.
 *
 * DENNE RUTEN LESER BEVISST INGEN COOKIES, INGEN ØKT OG INGEN IP.
 * Det er ikke en forglemmelse -- det er hele poenget. Ruten skal ikke ha
 * noen mulighet til å vite hvem som sender inn, slik at det heller ikke
 * senere kan bygges en kobling ved et uhell. Samme prinsipp som
 * /api/stats/submit-norm.
 *
 * HVA KLIENTEN FÅR BESTEMME, OG HVA DEN IKKE FÅR:
 * Klienten sender bare svarene, svartidene, nivået og en grov enhetstype.
 * Spørsmålssettversjon, appversjon og uke settes her på serveren -- de
 * beskriver hvilken utgave av testen som faktisk kjørte, og det vet serveren
 * bedre enn en klient som kan være utdatert eller manipulert.
 *
 * Feil svares det på med 200 og `{ ok: false }` i de tilfellene der noe gikk
 * galt på vår side, slik at klienten aldri viser en feil til brukeren for
 * noe som er ren bakgrunnsinfrastruktur. Ugyldige forespørsler får ekte
 * 400 -- de kommer uansett ikke fra vår egen klient.
 */

interface SubmitBody {
  tier: unknown;
  answers: unknown;
  responseMs: unknown;
  device: unknown;
}

/** Gyldige spørsmål-id-er, utledet fra selve spørsmålssettet -- ikke en egen liste å holde i synk. */
const VALID_IDS_FULL = new Set(ALL_QUESTIONS.map((q) => q.id));
const VALID_IDS_EXTENDED = new Set(ALL_QUESTIONS_EXTENDED.map((q) => q.id));

export async function POST(request: Request) {
  /**
   * Misbruksbrems (v2.50, kvalitetsrevisjon 31.07.2026 kveld, funn 5.3).
   *
   * Denne ruten validerer strukturen grundig, men ingenting hindret tidligere
   * at noen sendte inn titusenvis av syntetiske svarsett. Konsekvensen ville
   * ikke vært nedetid, men noe verre: et forgiftet psykometrisk grunnlag som
   * SER gyldig ut. Leddanalysen ville da pekt på "dårlige" spørsmål som i
   * virkeligheten bare var oversvømt av søppel.
   *
   * TAKET ER HEVET I v2.50 (kvalitetsrevisjon 01.08.2026, funn 10.1).
   *
   * Det sto opprinnelig på 5 per døgn, satt ut fra at ett ærlig menneske
   * sender inn ett svarsett. Det var feil måte å regne på, og feilen var
   * alvorligere enn den så ut: IP-adressen deles av alle bak samme nett.
   * En skoleklasse, et kontor eller et mobilt bærernett kunne dermed fylle
   * kvoten på noen få respondenter, og resten ble forkastet STILLE med
   * `{ ok: false }` og status 200.
   *
   * To ting gikk galt samtidig. For det første forsvant data fra en gruppe
   * som ikke er tilfeldig valgt -- og filhodet i lib/research/types.ts
   * advarer selv mot at manglende svar ikke er tilfeldig fordelt. For det
   * andre divergerte de to datasettene: /api/stats/submit-norm, som utløses
   * av NØYAKTIG samme brukerhandling, tillot 20 i timen. Normtallene tok
   * altså imot innsendinger som svarsettene forkastet.
   *
   * Taket følger nå submit-norm: 20 per time per IP. Det er fortsatt langt
   * under det et skript ville produsert, og godt over det et delt nett
   * genererer i praksis.
   *
   * Merk: dette er det ENESTE stedet ruten berører noe IP-relatert, og det
   * skjer inne i rateLimit.ts -- verken IP-en eller noe avledet av den når
   * selve svarsettet som lagres. Anonymitetsgarantien i filhodet til
   * lib/research/types.ts står derfor uendret.
   */
  const limited = await checkRateLimit(request, "research-submit", {
    windowMs: 60 * 60 * 1000,
    limit: 20,
  });
  if (!limited.ok) {
    // Stille avvisning: klienten vår viser aldri denne feilen til brukeren,
    // og en innsender som er over taket skal ikke få vite hvor taket går.
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  if (body.tier !== "full" && body.tier !== "extended") {
    return NextResponse.json({ error: "Ugyldig nivå." }, { status: 400 });
  }
  const tier = body.tier;
  const validIds = tier === "extended" ? VALID_IDS_EXTENDED : VALID_IDS_FULL;
  const expectedCount = tier === "extended" ? ALL_QUESTIONS_EXTENDED.length : ALL_QUESTIONS.length;

  if (typeof body.answers !== "object" || body.answers === null || Array.isArray(body.answers)) {
    return NextResponse.json({ error: "Ugyldige svar." }, { status: 400 });
  }

  // Bygg svarkartet på nytt fra bunnen i stedet for å stole på det innsendte.
  // Ukjente id-er forkastes stille -- de kan komme fra en klient som ligger
  // på en eldre utgave av spørsmålssettet.
  const answers: Record<string, ResearchAnswerValue> = {};
  for (const [id, value] of Object.entries(body.answers as Record<string, unknown>)) {
    if (validIds.has(id) && isValidResearchAnswerValue(value)) {
      answers[id] = value;
    }
  }

  // Bare FULLSTENDIGE sett lagres. Et delvis sett ville forurenset
  // leddanalysen: manglende svar er ikke tilfeldig fordelt (folk hopper av
  // på de vanskelige spørsmålene), så en delvis besvarelse trekker
  // statistikken systematisk skjevt.
  if (Object.keys(answers).length !== expectedCount) {
    return NextResponse.json({ error: "Ufullstendig svarsett." }, { status: 400 });
  }

  const responseMs: Record<string, number> = {};
  if (typeof body.responseMs === "object" && body.responseMs !== null && !Array.isArray(body.responseMs)) {
    for (const [id, value] of Object.entries(body.responseMs as Record<string, unknown>)) {
      if (!validIds.has(id) || typeof value !== "number") continue;
      const clamped = clampResponseMs(value);
      if (clamped !== null) responseMs[id] = clamped;
    }
  }

  const record: ResearchAnswerSet = {
    tier,
    // Settes på serveren -- se doc-kommentaren over.
    questionSetVersion: QUESTION_SET_VERSION,
    appVersion: APP_VERSION,
    week: isoWeek(),
    answers,
    responseMs,
    device: isValidResearchDevice(body.device) ? body.device : "ukjent",
  };

  const stored = await storeAnswerSet(record);
  return NextResponse.json({ ok: stored });
}
