"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Driftsstatus (v2.45, 31.07.2026). Se api/admin/health/route.ts for hva
 * som faktisk sjekkes -- og hva som bevisst ikke sjekkes.
 */

interface HealthCheck {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
}

interface Health {
  checks: HealthCheck[];
  questionSet: { revision: number; fingerprint: string };
}

export default function AdminHealthPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/health");
        if (!res.ok) {
          setError("Klarte ikke hente status.");
          return;
        }
        setHealth(await res.json());
      } catch {
        setError("Klarte ikke hente status.");
      }
    })();
  }, []);

  return (
    <AdminShell>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!health && !error && (
        <p className="text-sm text-indigo/50 dark:text-lavender-400/50">Sjekker …</p>
      )}

      {health && (
        <>
          <section className="flex flex-col gap-3 rounded-xl border border-lavender-400 p-5 dark:border-white/10">
            <div>
              <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
                Tjenester nettstedet er avhengig av
              </h2>
              <p className="mt-1 text-xs text-indigo/50 dark:text-lavender-400/50">
                Rødt her betyr at noe faktisk er i stykker, ikke at noen har gjort noe galt. De
                fleste røde punkter skyldes en manglende nøkkel i Netlify under
                Site configuration → Environment variables.
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {health.checks.map((check) => (
                <li
                  key={check.key}
                  className="flex items-start gap-3 rounded-lg bg-white/50 px-4 py-3 dark:bg-white/5"
                >
                  <span
                    aria-hidden
                    className={
                      check.ok
                        ? "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
                        : "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
                    }
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-indigo dark:text-white">
                      {check.label}
                      <span className="sr-only">{check.ok ? " — i orden" : " — feil"}</span>
                    </span>
                    <span className="text-xs text-indigo/60 dark:text-lavender-400/60">
                      {check.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2 rounded-xl border border-lavender-400 p-5 dark:border-white/10">
            <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
              Spørsmålssettet
            </h2>
            <p className="text-sm text-indigo/80 dark:text-lavender-400/80">
              Revisjon <strong>{health.questionSet.revision}</strong> · kontrolltall{" "}
              <code className="rounded bg-white/60 px-1.5 py-0.5 text-xs dark:bg-white/10">
                {health.questionSet.fingerprint}
              </code>
            </p>
            <p className="text-xs text-indigo/50 dark:text-lavender-400/50">
              Kontrolltallet regnes ut fra selve spørsmålstekstene. Endrer noen en formulering uten
              å øke revisjonsnummeret, endrer kontrolltallet seg mens revisjonen står stille — og da
              blandes svar på to ulike spørsmål i samme analyse. Noter derfor kontrolltallet her, og
              sammenlign når du har gjort språkendringer.
            </p>
          </section>
        </>
      )}
    </AdminShell>
  );
}
