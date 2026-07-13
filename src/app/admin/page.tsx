"use client";

import { useEffect, useState } from "react";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import type { AdminSettings } from "@/lib/admin/store";

type Screen = "loading" | "register" | "login" | "panel";

export default function AdminPage() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void checkStatus();
  }, []);

  async function checkStatus() {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      setSettings(await res.json());
      setScreen("panel");
      return;
    }
    // Ikke innlogget -- finn ut om det finnes en registrert passkey ennå.
    const optionsRes = await fetch("/api/admin/login/options");
    setScreen(optionsRes.ok ? "login" : "register");
  }

  async function handleRegister() {
    setError(null);
    try {
      const optionsRes = await fetch("/api/admin/register/options");
      if (!optionsRes.ok) throw new Error((await optionsRes.json()).error);
      const options = await optionsRes.json();
      const attestation = await startRegistration({ optionsJSON: options });
      const verifyRes = await fetch("/api/admin/register/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(attestation),
      });
      if (!verifyRes.ok) throw new Error((await verifyRes.json()).error);
      await handleLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrering feilet.");
    }
  }

  async function handleLogin() {
    setError(null);
    try {
      const optionsRes = await fetch("/api/admin/login/options");
      if (!optionsRes.ok) throw new Error((await optionsRes.json()).error);
      const options = await optionsRes.json();
      const assertion = await startAuthentication({ optionsJSON: options });
      const verifyRes = await fetch("/api/admin/login/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(assertion),
      });
      if (!verifyRes.ok) throw new Error((await verifyRes.json()).error);
      await checkStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Innlogging feilet.");
    }
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
    await fetch("/api/admin/logout", { method: "POST" });
    setSettings(null);
    setScreen("login");
  }

  if (screen === "loading") return null;

  if (screen === "register" || screen === "login") {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold text-ink dark:text-white">FemFaktorer admin</h1>
        {screen === "register" ? (
          <>
            <p className="text-sm text-ink/70 dark:text-warmgray/70">
              Ingen admin-passkey er registrert ennå. Opprett én med Face ID, Touch ID eller
              tilsvarende på denne enheten.
            </p>
            <button onClick={handleRegister} className="rounded-lg bg-teal px-5 py-2.5 font-medium text-white">
              Registrer passkey
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-ink/70 dark:text-warmgray/70">Logg inn med din passkey.</p>
            <button onClick={handleLogin} className="rounded-lg bg-teal px-5 py-2.5 font-medium text-white">
              Logg inn
            </button>
          </>
        )}
        {error && <p className="text-sm text-coral">{error}</p>}
      </main>
    );
  }

  if (!settings) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink dark:text-white">Admin-panel</h1>
        <button onClick={handleLogout} className="text-sm text-ink/60 underline dark:text-warmgray/60">
          Logg ut
        </button>
      </div>

      <section className="flex flex-col gap-4 rounded-lg border border-warmgray p-5 dark:border-white/10">
        <label className="flex items-center justify-between gap-4">
          <span>FEM (AI-veileder) er på</span>
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
            className="rounded border border-warmgray px-3 py-1.5 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">AI-modell</span>
          <input
            type="text"
            value={settings.aiModel}
            onChange={(e) => void saveSettings({ aiModel: e.target.value })}
            className="rounded border border-warmgray px-3 py-1.5 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span>AI-spørsmålstak per bruker/økt</span>
          <input
            type="number"
            value={settings.aiMaxQuestionsPerSession}
            onChange={(e) => void saveSettings({ aiMaxQuestionsPerSession: Number(e.target.value) })}
            className="w-24 rounded border border-warmgray px-3 py-1.5 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span>Globalt AI-spørsmålstak (gratis utprøving)</span>
          <input
            type="number"
            value={settings.aiGlobalQuestionCap}
            onChange={(e) => void saveSettings({ aiGlobalQuestionCap: Number(e.target.value) })}
            className="w-28 rounded border border-warmgray px-3 py-1.5 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        {saving && <p className="text-xs text-ink/50 dark:text-warmgray/50">Lagrer …</p>}
      </section>

      <p className="text-xs text-ink/50 dark:text-warmgray/50">
        Dashboard med besøkstall, gjennomførte tester og AI-kostnad er ikke bygget i dette
        utkastet -- se Dokument 09 §21.1 for full spesifikasjon, dette dekker foreløpig bare
        de tekniske bryterne.
      </p>
    </main>
  );
}
