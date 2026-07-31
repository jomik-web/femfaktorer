"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import type { AdminSettings } from "@/lib/admin/store";

/**
 * Alle brytere ett sted (v2.46, 31.07.2026).
 *
 * De tre nederste bryterne ("Hva som er synlig på nettstedet") fantes fram
 * til nå bare som konstanter i src/lib/featureFlags.ts, og krevde altså en
 * kodeendring og en ny utrulling for å skrus av eller på. Det er den
 * endringen som sparer produkteier mest tid i det daglige.
 *
 * Lagring skjer ved hver endring, ikke bak en "Lagre"-knapp -- med så få
 * felter er en glemt lagring en større risiko enn et utilsiktet klikk, og
 * hver bryter er umiddelbart reverserbar.
 */

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm text-indigo dark:text-white">{label}</span>
        {description && (
          <span className="text-xs text-indigo/50 dark:text-lavender-400/50">{description}</span>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-holo-sky"
      />
    </label>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) setSettings(await res.json());
      } catch {
        setError("Klarte ikke hente innstillingene.");
      }
    })();
  }, []);

  async function save(partial: Partial<AdminSettings>) {
    if (!settings) return;
    const next = { ...settings, ...partial };
    setSettings(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) setError("Endringen ble ikke lagret.");
    } catch {
      setError("Endringen ble ikke lagret.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <AdminShell>
        <p className="text-sm text-indigo/50 dark:text-lavender-400/50">
          {error ?? "Henter innstillinger …"}
        </p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <section className="flex flex-col divide-y divide-lavender-400 rounded-xl border border-lavender-400 p-5 dark:divide-white/10 dark:border-white/10">
        <div className="pb-2">
          <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
            Hva som er synlig på nettstedet
          </h2>
          <p className="mt-1 text-xs text-indigo/50 dark:text-lavender-400/50">
            Virker med én gang, uten ny utrulling. Besøkende som allerede har siden åpen ser
            endringen innen et halvt minutt.
          </p>
        </div>
        <Toggle
          label="Innlogging og konto"
          description="Skjuler «Logg inn» i menyen og bunnteksten når den er av. Du kommer fortsatt inn i adminpanelet via /logg-inn."
          checked={settings.accountSaveEnabled}
          onChange={(v) => void save({ accountSaveEnabled: v })}
        />
        <Toggle
          label="«Lagre resultatet på konto»"
          description="Selve lagringsskjemaet under Verktøy. Var satt på pause under betatestingen."
          checked={settings.resultAccountSaveEnabled}
          onChange={(v) => void save({ resultAccountSaveEnabled: v })}
        />
        <Toggle
          label="Svardata-verktøyet (last ned/opp CSV)"
          description="Betatesternes måte å slippe å svare på alt på nytt etter en oppdatering."
          checked={settings.betaAnswerSetToolsEnabled}
          onChange={(v) => void save({ betaAnswerSetToolsEnabled: v })}
        />
      </section>

      <section className="flex flex-col divide-y divide-lavender-400 rounded-xl border border-lavender-400 p-5 dark:divide-white/10 dark:border-white/10">
        <div className="pb-2">
          <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
            Spir (AI-veilederen)
          </h2>
        </div>
        <Toggle
          label="Spir er på"
          checked={settings.aiEnabled}
          onChange={(v) => void save({ aiEnabled: v })}
        />
        <label className="flex items-center justify-between gap-4 py-2">
          <span className="flex flex-col gap-0.5">
            <span className="text-sm text-indigo dark:text-white">AI-modell</span>
            <span className="text-xs text-indigo/50 dark:text-lavender-400/50">
              Modellnavnet må stemme nøyaktig, ellers slutter Spir å svare. Endre bare hvis du vet
              hva du gjør.
            </span>
          </span>
          <input
            type="text"
            value={settings.aiModel}
            onChange={(e) => void save({ aiModel: e.target.value })}
            className="w-56 shrink-0 rounded-lg border border-lavender-400 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-transparent dark:text-white"
          />
        </label>
        <label className="flex items-center justify-between gap-4 py-2">
          <span className="text-sm text-indigo dark:text-white">Spørsmålstak per bruker/økt</span>
          <input
            type="number"
            value={settings.aiMaxQuestionsPerSession}
            onChange={(e) => void save({ aiMaxQuestionsPerSession: Number(e.target.value) })}
            className="w-24 shrink-0 rounded-lg border border-lavender-400 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-transparent dark:text-white"
          />
        </label>
        <label className="flex items-center justify-between gap-4 py-2">
          <span className="flex flex-col gap-0.5">
            <span className="text-sm text-indigo dark:text-white">Globalt spørsmålstak</span>
            <span className="text-xs text-indigo/50 dark:text-lavender-400/50">
              Kostnadssperren din. Når den er nådd, slutter Spir å svare for alle. Se forbruket på
              Oversikt.
            </span>
          </span>
          <input
            type="number"
            value={settings.aiGlobalQuestionCap}
            onChange={(e) => void save({ aiGlobalQuestionCap: Number(e.target.value) })}
            className="w-28 shrink-0 rounded-lg border border-lavender-400 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-transparent dark:text-white"
          />
        </label>
      </section>

      <section className="flex flex-col divide-y divide-lavender-400 rounded-xl border border-lavender-400 p-5 dark:divide-white/10 dark:border-white/10">
        <div className="pb-2">
          <h2 className="font-display text-base font-semibold text-indigo dark:text-white">
            Vedlikehold
          </h2>
        </div>
        <Toggle
          label="Vedlikeholdsmodus"
          checked={settings.maintenanceMode}
          onChange={(v) => void save({ maintenanceMode: v })}
        />
        <label className="flex flex-col gap-1 py-2">
          <span className="text-sm text-indigo dark:text-white">Melding til besøkende</span>
          <input
            type="text"
            value={settings.maintenanceMessage}
            onChange={(e) => void save({ maintenanceMessage: e.target.value })}
            className="rounded-lg border border-lavender-400 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-transparent dark:text-white"
          />
        </label>
      </section>

      <p className="text-xs text-indigo/45 dark:text-lavender-400/45">
        {saving ? "Lagrer …" : error ? error : "Alle endringer lagres automatisk."}
      </p>
    </AdminShell>
  );
}
