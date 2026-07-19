"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdminSettings } from "@/lib/admin/store";

/**
 * v2.28 (kvalitetsrevisjon 19.07.2026): admin-tilgang skjer nå via den
 * vanlige e-post/kode-innloggingen (samme som "hent lagret resultat", se
 * /logg-inn og SiteNav) i stedet for en egen WebAuthn-passkey. Se
 * lib/admin/roles.ts for begrunnelsen -- det gamle systemet hadde et
 * kritisk sikkerhetshull der hvem som helst kunne registrere seg som admin
 * før produkteier rakk det selv.
 *
 * Selve dette panelets utforming (utover selve tilgangssjekken) er
 * uendret -- en egen gjennomgang av admin-UI-et er varslet til senere.
 */

type Screen = "loading" | "logged-out" | "not-admin" | "panel";

export default function AdminPage() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void checkStatus();
  }, []);

  async function checkStatus() {
    const meRes = await fetch("/api/account/me");
    const me = await meRes.json();
    if (!me.loggedIn) {
      setScreen("logged-out");
      return;
    }
    setEmail(me.email ?? null);

    const settingsRes = await fetch("/api/admin/settings");
    if (!settingsRes.ok) {
      setScreen("not-admin");
      return;
    }
    setSettings(await settingsRes.json());
    setScreen("panel");
  }

  async function saveSettings(partial: Partial<AdminSettings>) {
    if (!settings) return;
    setSaving(true);
    const next = { ...settings, ...partial };
    setSettings(next);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/account/logout", { method: "POST" });
    setSettings(null);
    setEmail(null);
    setScreen("logged-out");
  }

  if (screen === "loading") return null;

  if (screen === "logged-out") {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold text-indigo dark:text-white">Dine Fasetter admin</h1>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Logg inn med e-postadressen din for å få admin-tilgang, dersom kontoen din har
          admin-rolle.
        </p>
        <Link
          href="/logg-inn"
          className="rounded-lg bg-holo-sky px-5 py-2.5 font-medium text-indigo"
        >
          Logg inn
        </Link>
      </main>
    );
  }

  if (screen === "not-admin") {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold text-indigo dark:text-white">Dine Fasetter admin</h1>
        <p className="text-sm text-indigo/70 dark:text-lavender-400/70">
          Du er logget inn som <span className="font-medium">{email}</span>, men denne kontoen har
          ikke admin-tilgang.
        </p>
        <button
          onClick={handleLogout}
          className="text-sm text-holo-skyText underline underline-offset-2"
        >
          Logg ut
        </button>
      </main>
    );
  }

  if (!settings) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-indigo dark:text-white">Admin-panel</h1>
          <p className="text-xs text-indigo/50 dark:text-lavender-400/50">Innlogget som {email}</p>
        </div>
        <button onClick={handleLogout} className="text-sm text-indigo/60 underline dark:text-lavender-400/60">
          Logg ut
        </button>
      </div>

      <section className="flex flex-col gap-4 rounded-lg border border-lavender-400 p-5 dark:border-white/10">
        <label className="flex items-center justify-between gap-4">
          <span>Spir (AI-veileder) er på</span>
          <input
            type="checkbox"
            checked={settings.aiEnabled}
            onChange={(e) => void saveSettings({ aiEnabled: e.target.checked })}
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span>Vedlikeholdsmodus</span>
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => void saveSettings({ maintenanceMode: e.target.checked })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">Vedlikeholdsmelding</span>
          <input
            type="text"
            value={settings.maintenanceMessage}
            onChange={(e) => void saveSettings({ maintenanceMessage: e.target.value })}
            className="rounded border border-lavender-400 px-3 py-1.5 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">AI-modell</span>
          <input
            type="text"
            value={settings.aiModel}
            onChange={(e) => void saveSettings({ aiModel: e.target.value })}
            className="rounded border border-lavender-400 px-3 py-1.5 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span>AI-spørsmålstak per bruker/økt</span>
          <input
            type="number"
            value={settings.aiMaxQuestionsPerSession}
            onChange={(e) => void saveSettings({ aiMaxQuestionsPerSession: Number(e.target.value) })}
            className="w-24 rounded border border-lavender-400 px-3 py-1.5 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span>Globalt AI-spørsmålstak (gratis utprøving)</span>
          <input
            type="number"
            value={settings.aiGlobalQuestionCap}
            onChange={(e) => void saveSettings({ aiGlobalQuestionCap: Number(e.target.value) })}
            className="w-28 rounded border border-lavender-400 px-3 py-1.5 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        {saving && <p className="text-xs text-indigo/50 dark:text-lavender-400/50">Lagrer …</p>}
      </section>

      <p className="text-xs text-indigo/50 dark:text-lavender-400/50">
        Dashboard med besøkstall, gjennomførte tester, AI-kostnad og administrasjon av hvem som har
        admin-rolle er ikke bygget i dette utkastet -- kommer i en egen runde med eget forslag til
        utforming.
      </p>
    </main>
  );
}
