// Zwei kurze In-App-Umfragen für Tester (siehe data/testerMode.js), an
// zwei Zeitpunkten ausgelöst: direkt nach dem ersten erfolgreichen
// Import und nach Erreichen des Test-Import-Limits (Ende der
// Testphase). Der eigentliche Frage-Fluss steckt in
// components/SurveyModal.jsx - hier nur das "welche Umfrage steht an"
// / "wurde sie schon gezeigt" - Bookkeeping. Beide werden jeweils nur
// EINMAL gezeigt - egal ob beantwortet oder weggeklickt ("Später") -
// damit niemand wiederholt genervt wird.

export const SURVEY_IDS = {
  FIRST_IMPORT: "first-import",
  TEST_PHASE: "test-phase",
};

const SHOWN_PREFIX = "kochbuch_v2_survey_shown_";
const PENDING_KEY = "kochbuch_v2_survey_pending";

function hasBeenShown(surveyId) {
  return localStorage.getItem(SHOWN_PREFIX + surveyId) === "true";
}

/** Merkt eine Umfrage als "sollte als Nächstes gezeigt werden" vor. */
export function markSurveyPending(surveyId) {
  if (hasBeenShown(surveyId)) return;
  localStorage.setItem(PENDING_KEY, surveyId);
}

/** Liefert die ID der aktuell anstehenden Umfrage (oder null), falls sie noch nicht gezeigt wurde. */
export function getPendingSurveyId() {
  const id = localStorage.getItem(PENDING_KEY);
  if (!id || hasBeenShown(id)) return null;
  return id;
}

/** Markiert eine Umfrage endgültig als erledigt (beantwortet oder übersprungen). */
export function markSurveyShown(surveyId) {
  localStorage.setItem(SHOWN_PREFIX + surveyId, "true");
  localStorage.removeItem(PENDING_KEY);
}
