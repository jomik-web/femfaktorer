import { NextResponse } from "next/server";
import { requireAdminEmail } from "@/lib/admin/auth";
import { readRange, readDailySeries } from "@/lib/metrics/blobs";
import { medianFromDurationBuckets } from "@/lib/metrics/types";
import { countAnswerSets } from "@/lib/research/blobs";
import { getGlobalAiUsage } from "@/lib/admin/aiUsage";
import { readStore } from "@/lib/admin/store";
import { normStatsStore } from "@/lib/stats/blobs";
import { QUESTION_SET_VERSION, QUESTION_SET_REVISION } from "@/data/questionSetVersion";
import { APP_VERSION } from "@/lib/version";
import type { NormStats } from "@/lib/stats/types";

export const runtime = "nodejs";

/**
 * Tallgrunnlaget for adminpanelets forside.
 *
 * Alt her er AGGREGATER. Ingen enkeltperson kan leses ut av dette svaret, og
 * det skal forbli slik -- da trenger ikke denne siden en egen adgangslogg
 * (jf. GDPR art. 32 og Datatilsynets krav om logging ved oppslag på
 * personopplysninger). Skal det en gang legges til oppslag på enkeltkontoer,
 * hører det hjemme i et eget, logget endepunkt -- ikke her.
 */
async function readNormTotal(tier: "full" | "extended"): Promise<number> {
  try {
    const stats = (await normStatsStore(tier).get("aggregate", { type: "json" })) as NormStats | null;
    return stats?.totalSubmissions ?? 0;
  } catch {
    return 0;
  }
}

export async function GET(request: Request) {
  if (!(await requireAdminEmail())) {
    return NextResponse.json({ error: "Ikke innlogget som admin." }, { status: 401 });
  }

  const url = new URL(request.url);
  const days = Math.min(Math.max(Number.parseInt(url.searchParams.get("days") ?? "7", 10) || 7, 1), 90);

  const [range, series, researchCount, aiUsage, settings, normFull, normExtended] = await Promise.all([
    readRange(days),
    readDailySeries(Math.min(days, 30)),
    countAnswerSets(),
    getGlobalAiUsage(),
    readStore(),
    readNormTotal("full"),
    readNormTotal("extended"),
  ]);

  const started = range.test_started ?? 0;
  const completedAny =
    (range.completed_free ?? 0) + (range.completed_full ?? 0) + (range.completed_extended ?? 0);

  return NextResponse.json({
    days,
    appVersion: APP_VERSION,
    questionSet: { version: QUESTION_SET_VERSION, revision: QUESTION_SET_REVISION },

    /** Trakten, i den rekkefølgen brukeren møter den. */
    funnel: {
      started,
      reached50: range.reached_checkpoint_50 ?? 0,
      reached120: range.reached_checkpoint_120 ?? 0,
      completedFree: range.completed_free ?? 0,
      completedFull: range.completed_full ?? 0,
      completedExtended: range.completed_extended ?? 0,
      resultViewed: range.result_viewed ?? 0,
      spirOpened: range.spir_opened ?? 0,
      feedbackSubmitted: range.feedback_submitted ?? 0,
    },

    /** Andel av dem som startet, som fullførte på et eller annet nivå. */
    completionRate: started > 0 ? Math.round((completedAny / started) * 100) : null,

    /** Median tidsbruk i minutter, per nivå. null = ingen målinger i perioden. */
    medianMinutes: {
      full: medianFromDurationBuckets(range, "full"),
      extended: medianFromDurationBuckets(range, "extended"),
    },

    consent: {
      consented: range.research_consented ?? 0,
      declined: range.research_declined ?? 0,
    },

    /** Totaler som ikke er tidsavgrenset -- de har vært talt siden funksjonen ble slått på. */
    totals: {
      researchAnswerSets: researchCount,
      normSubmissionsFull: normFull,
      normSubmissionsExtended: normExtended,
      aiCallsUsed: aiUsage,
      aiGlobalCap: settings.settings.aiGlobalQuestionCap,
    },

    /** Dag for dag, til den enkle kurven i panelet. */
    series: series.map((entry) => ({
      day: entry.day,
      started: entry.metrics.test_started ?? 0,
      completed:
        (entry.metrics.completed_free ?? 0) +
        (entry.metrics.completed_full ?? 0) +
        (entry.metrics.completed_extended ?? 0),
    })),
  });
}
