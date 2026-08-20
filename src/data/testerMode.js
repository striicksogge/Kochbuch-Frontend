// Test-Zugang für eine kleine Gruppe von Testern, ohne echtes Account-
// System (das die App bewusst nicht hat). Aktivierung über einen
// Link-Parameter (?tester=1), der Zustand landet danach dauerhaft in
// diesem Browser/Gerät - rein clientseitig, kein Backend-Login.
//
// Bewusste Grenze: Das ist ein freundliches Limit, kein Sicherheits-
// mechanismus. Wer localStorage löscht, bekommt neue 10 Versuche. Für
// eine Handvoll vertrauter Tester ist das ausreichend.

import { markSurveyPending, SURVEY_IDS } from "./surveys";

const MODE_KEY = "kochbuch_v2_tester_mode";
const COUNT_KEY = "kochbuch_v2_tester_import_count";

export const TESTER_IMPORT_LIMIT = 10;

export function isTesterMode() {
  return localStorage.getItem(MODE_KEY) === "true";
}

/**
 * Liest ?tester=1 aus den URL-Suchparametern und aktiviert den Testmodus dauerhaft.
 * ?tester=0 deaktiviert ihn wieder (z. B. für den Betreiber selbst, falls der eigene
 * Link versehentlich mit ?tester=1 aufgerufen wurde) - löscht nur das Testmodus-Flag
 * und den Importzähler, keine Rezepte.
 */
export function activateTesterModeFromParams(searchParams) {
  if (searchParams.get("tester") === "1") {
    localStorage.setItem(MODE_KEY, "true");
  } else if (searchParams.get("tester") === "0") {
    localStorage.removeItem(MODE_KEY);
    localStorage.removeItem(COUNT_KEY);
  }
}

export function getImportCount() {
  return Number(localStorage.getItem(COUNT_KEY) || "0");
}

export function getImportsRemaining() {
  return Math.max(0, TESTER_IMPORT_LIMIT - getImportCount());
}

export function hasReachedImportLimit() {
  return getImportCount() >= TESTER_IMPORT_LIMIT;
}

/**
 * Zählt nur ERFOLGREICHE Importe (tatsächlich gespeichertes Rezept), nicht
 * Versuche. Löst außerdem die beiden Tester-Umfragen aus (data/surveys.js):
 * einmal direkt nach dem allerersten Import, einmal beim Erreichen des
 * Test-Limits (Ende der Testphase).
 */
export function recordSuccessfulImport() {
  const newCount = getImportCount() + 1;
  localStorage.setItem(COUNT_KEY, String(newCount));

  if (newCount === 1) markSurveyPending(SURVEY_IDS.FIRST_IMPORT);
  if (newCount === TESTER_IMPORT_LIMIT) markSurveyPending(SURVEY_IDS.TEST_PHASE);
}
