// Feedback von Testern geht direkt an Formspree (kostenloser Formular-Dienst,
// leitet an die eigene E-Mail weiter + sammelt in einem Web-Dashboard) - kein
// eigenes Backend nötig, kein Datenbank-Umbau. Formspree unterstützt AJAX-
// Einsendungen von jedem Ursprung, wenn "Accept: application/json" gesetzt ist
// (sonst würde es einen Redirect auf eine Formspree-eigene Seite versuchen).

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xkjwpjbw";

/**
 * Schickt eine Feedback-Nachricht ab. Ergänzt automatisch ein paar technische
 * Angaben (aktuelle Seite, Gerät, Zeitpunkt), damit ein Fehlerbericht auch
 * ohne Rückfrage nützlich ist.
 */
export async function sendFeedback({ category, message }) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      category,
      message,
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
