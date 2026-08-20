// Feedback von Testern geht direkt an Formspree (kostenloser Formular-Dienst,
// leitet an die eigene E-Mail weiter + sammelt in einem Web-Dashboard) - kein
// eigenes Backend nötig, kein Datenbank-Umbau. Formspree unterstützt AJAX-
// Einsendungen von jedem Ursprung, wenn "Accept: application/json" gesetzt ist
// (sonst würde es einen Redirect auf eine Formspree-eigene Seite versuchen).

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xkjwpjbw";

/**
 * Schickt eine Feedback-Nachricht ab. Ergänzt automatisch ein paar technische
 * Angaben (aktuelle Seite, Gerät, Zeitpunkt), damit ein Fehlerbericht auch
 * ohne Rückfrage nützlich ist. name/email sind optional - nur ausgefüllt,
 * wenn sich der Nutzer ggf. zurückmelden lassen möchte (siehe
 * components/WeiteresMenu.jsx: "Fehler melden" / "Ideen für REZIPI").
 */
export async function sendFeedback({ category, message, name, email }) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      category,
      message,
      name: name || "",
      email: email || "",
      page: window.location.hash || "/",
      userAgent: navigator.userAgent,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      sentAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Formspree antwortete mit Status ${response.status}`);
  }
}

/**
 * Schickt die Antwort auf eine der beiden Tester-Umfragen ab (siehe
 * data/surveys.js und components/SurveyModal.jsx für den Frage-Fluss).
 * Läuft über denselben Formspree-Endpunkt wie das Feedback-Formular,
 * aber mit "type: survey" markiert, damit beides im Formspree-
 * Dashboard auseinanderzuhalten ist. "answers" enthält die
 * Fluss-spezifischen Felder (z. B. rating/comment oder
 * satisfied/wouldContinue/willingToPay), ein Objekt statt fester
 * Parameter, weil beide Umfragen unterschiedliche Felder sammeln.
 */
export async function sendSurveyResponse({ surveyId, answers }) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      type: "survey",
      surveyId,
      ...answers,
      page: window.location.hash || "/",
      userAgent: navigator.userAgent,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      sentAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Formspree antwortete mit Status ${response.status}`);
  }
}
