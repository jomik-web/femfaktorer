"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Administrasjon av hvem som har admin-rolle (v2.45, 31.07.2026).
 *
 * Lukker et punkt som har stått åpent i OPPGAVER-FOR-PRODUKTEIER.md siden
 * v2.28: rollefunksjonene og API-et har eksistert hele tiden, men det fantes
 * ingen skjerm å bruke dem fra.
 *
 * Bootstrap-adminen (produkteiers egen adresse, hardkodet i
 * lib/admin/roles.ts) vises med lås og kan ikke fjernes -- verken herfra
 * eller via API-et. Det er den mekanismen som gjør at man aldri kan låse seg
 * selv ute, uansett hva som skjer med lagringen eller med denne siden.
 */
export default function AdminRolesPage() {
  const [admins, setAdmins] = useState<string[]>([]);
  const [bootstrapAdmin, setBootstrapAdmin] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    try {
      const res = await fetch("/api/admin/roles");
      if (!res.ok) return;
      const data = await res.json();
      setAdmins(data.admins ?? []);
      setBootstrapAdmin(data.bootstrapAdmin ?? null);
    } catch {
      setError("Klarte ikke hente listen.");
    } finally {
      setLoaded(true);
    }
  }

  async function addAdmin(event: React.FormEvent) {
    event.preventDefault();
    const email = newEmail.trim();
    if (!email) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke legge til.");
        return;
      }
      setAdmins(data.admins ?? []);
      setNewEmail("");
    } catch {
      setError("Klarte ikke legge til.");
    } finally {
      setBusy(false);
    }
  }

  async function removeAdmin(email: string) {
    // Bevisst en bekreftelse: å fjerne en admin ved et uhell oppdages ikke
    // før vedkommende neste gang prøver å logge inn og ikke slipper til.
    if (!window.confirm(`Fjerne admin-tilgang for ${email}?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Klarte ikke fjerne.");
        return;
      }
      setAdmins(data.admins ?? []);
    } catch {
      setError("Klarte ikke fjerne.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell>
      <section className="flex flex-col gap-4 rounded-xl border border-lavender-400 p-5 dark:border-white/10">
        <div>
          <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
            Hvem har admin-tilgang
          </h2>
          <p className="mt-1 text-xs text-indigo/50 dark:text-lavender-400/50">
            Admin-tilgang følger e-postadressen som logges inn med den vanlige innloggingen. Det
            finnes ingen egen adminpålogging å miste eller få kapret.
          </p>
        </div>

        {!loaded && <p className="text-sm text-indigo/50 dark:text-lavender-400/50">Henter …</p>}

        <ul className="flex flex-col gap-2">
          {admins.map((email) => {
            const isBootstrap = email === bootstrapAdmin;
            return (
              <li
                key={email}
                className="flex items-center justify-between gap-3 rounded-lg bg-white/50 px-4 py-2.5 dark:bg-white/5"
              >
                <span className="text-sm text-indigo dark:text-white">{email}</span>
                {isBootstrap ? (
                  <span className="shrink-0 text-xs text-indigo/45 dark:text-lavender-400/45">
                    Fast adminkonto -- kan ikke fjernes
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeAdmin(email)}
                    className="shrink-0 text-xs text-red-600 underline underline-offset-2 disabled:opacity-40 dark:text-red-400"
                  >
                    Fjern
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <form onSubmit={addAdmin} className="flex flex-wrap items-center gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="ny.admin@eksempel.no"
            className="min-w-[220px] flex-1 rounded-lg border border-lavender-400 px-3 py-2 text-sm dark:border-white/20 dark:bg-transparent dark:text-white"
          />
          <button
            type="submit"
            disabled={busy || !newEmail.trim()}
            className="rounded-lg bg-holo-sky px-4 py-2 text-sm font-medium text-indigo disabled:opacity-40"
          >
            Gi admin-tilgang
          </button>
        </form>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <p className="text-xs text-indigo/45 dark:text-lavender-400/45">
          Den du legger til får tilgang neste gang de logger inn med denne adressen. De må ha, eller
          opprette, en vanlig konto -- rollen alene lager ingen konto.
        </p>
      </section>
    </AdminShell>
  );
}
