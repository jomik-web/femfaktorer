import type { StoredAccountResult } from "@/lib/account/types";

/**
 * "Utvikling over tid" (v2.27) -- kun relevant for "extended" (Premium-
 * nivå, 290 spm). Regner ut endring fra forrige lagring for hver
 * hovedfaktor (nøytralt -- ALDRI farget eller omtalt som "bedre"/"verre",
 * se den avgjorte holdningen til utviklingsråd, v2.23/17.07.2026: dette er
 * et bilde av variasjon over tid, ikke en vurdering).
 *
 * v2.45 (Kvalitetsrevisjon 31.07.2026, kap. 5, funn 1): flyttet ut av
 * resultat/page.tsx til egen fil. `history.length > 1`-sjekken lå tidligere
 * i kallstedet i page.tsx -- ligger nå inni komponenten selv, slik at
 * ResultatContent kun trenger å styre PÅ/AV via de øvrige, kontoavhengige
 * betingelsene (resultAccountSaveEnabled/tier/loggedInEmail).
 */
export function HistoryTable({ history }: { history: StoredAccountResult[] }) {
  if (history.length <= 1) return null;

  const withDeltas = history.map((entry, i) => {
    const prev = i > 0 ? history[i - 1] : null;
    const deltas = prev
      ? entry.factors.map((f) => {
          const prevScore = prev.factors.find((pf) => pf.factor === f.factor)?.score;
          return prevScore === undefined ? null : Math.round(f.score) - Math.round(prevScore);
        })
      : null;
    return { entry, deltas };
  });
  const columns = history[history.length - 1]?.factors ?? [];

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-holo-sky/30 bg-white/60 p-5 shadow-sm dark:bg-white/5 print:hidden">
      <h2 className="font-display font-semibold text-indigo dark:text-white">Utvikling over tid</h2>
      <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
        Du har lagret {history.length} resultater av Utvidet versjon knyttet til denne
        kontoen. Her ser du hvordan de fem hovedfaktorene har målt seg fra gang til gang --
        ikke som en vurdering av om noe er «bedre» eller «verre», bare som et bilde av
        hvordan svarene dine har variert over tid. Endringstall (i parentes) viser
        differansen fra forrige lagrede resultat.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-indigo/10 dark:border-white/10">
              <th className="py-2 pr-4 font-medium text-indigo dark:text-white">Dato</th>
              {columns.map((f) => (
                <th key={f.factor} className="py-2 pr-4 font-medium text-indigo dark:text-white">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...withDeltas].reverse().map(({ entry, deltas }) => (
              <tr key={entry.savedAt} className="border-b border-indigo/5 dark:border-white/5">
                <td className="py-2 pr-4 text-indigo/70 dark:text-lavender-400/70">
                  {new Date(entry.savedAt).toLocaleDateString("no-NO")}
                </td>
                {entry.factors.map((f, i) => {
                  const delta = deltas?.[i] ?? null;
                  return (
                    <td key={f.factor} className="py-2 pr-4 text-indigo/80 dark:text-lavender-400/80">
                      {Math.round(f.score)}
                      {delta !== null && (
                        <span className="text-indigo/50 dark:text-lavender-400/50">
                          {" "}
                          ({delta > 0 ? `+${delta}` : delta === 0 ? "±0" : `−${Math.abs(delta)}`})
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
