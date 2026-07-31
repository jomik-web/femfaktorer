"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  ACCOUNT_SAVE_ENABLED,
  RESULT_ACCOUNT_SAVE_ENABLED,
  BETA_ANSWER_SET_TOOLS_ENABLED,
} from "@/lib/featureFlags";

/**
 * Leverer funksjonsbryterne til klientkomponentene (v2.45, 31.07.2026).
 *
 * HVORFOR KLIENTSIDIG HENTING OG IKKE SERVERSIDIG?
 * Alternativet var å lese innstillingene i layout.tsx og sende dem ned som
 * props. Det ville gitt riktig verdi allerede ved første tegning -- men også
 * gjort HELE nettstedet dynamisk: hver eneste sidevisning ville måttet vente
 * på et oppslag mot Netlify Blobs før noe kunne sendes til nettleseren. For
 * et nettsted som ellers kan serveres statisk er det en merkbar
 * hastighetskostnad å betale for tre av/på-brytere.
 *
 * Løsningen her har én synlig ulempe, og det er verdt å kjenne til den:
 * i det korte øyeblikket før svaret fra /api/flags er kommet, gjelder
 * verdiene fra featureFlags.ts. Har du skrudd en bryter til noe ANNET enn
 * standardverdien, kan et element derfor blinke kort før det forsvinner
 * (eller motsatt). Er det plagsomt for en bestemt bryter, er riktig løsning
 * å endre standardverdien i featureFlags.ts til å matche -- ikke å bygge om
 * hele leveringsmåten.
 */

export interface RuntimeFlags {
  accountSaveEnabled: boolean;
  resultAccountSaveEnabled: boolean;
  betaAnswerSetToolsEnabled: boolean;
}

/** Verdiene som gjelder inntil noe annet er hentet -- og hvis henting feiler. */
export const DEFAULT_FLAGS: RuntimeFlags = {
  accountSaveEnabled: ACCOUNT_SAVE_ENABLED,
  resultAccountSaveEnabled: RESULT_ACCOUNT_SAVE_ENABLED,
  betaAnswerSetToolsEnabled: BETA_ANSWER_SET_TOOLS_ENABLED,
};

const FlagsContext = createContext<RuntimeFlags>(DEFAULT_FLAGS);

export function useFlags(): RuntimeFlags {
  return useContext(FlagsContext);
}

function isRuntimeFlags(value: unknown): value is RuntimeFlags {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.accountSaveEnabled === "boolean" &&
    typeof v.resultAccountSaveEnabled === "boolean" &&
    typeof v.betaAnswerSetToolsEnabled === "boolean"
  );
}

export function FlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<RuntimeFlags>(DEFAULT_FLAGS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/flags")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        // Validerer før bruk -- et halvt svar skal ikke kunne skru av halve
        // nettstedet. Ved noe uventet blir standardverdiene stående.
        if (!cancelled && isRuntimeFlags(data)) setFlags(data);
      })
      .catch(() => {
        // Stille -- standardverdiene gjelder, som er den trygge tilstanden.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>;
}
