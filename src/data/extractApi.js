// Ruft dasselbe Backend auf, das schon für den ersten Prototyp gebaut wurde
// (oEmbed-Abruf + Claude-Extraktion). Die URL kommt aus einer Vite-
// Umgebungsvariable, damit sie nicht hart im Code steht – mit Fallback
// auf die bereits bestehende, funktionierende Render-Instanz.

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://kochbuch-backend-v5l3.onrender.com";

/**
 * Ruft POST /extract auf und liefert die strukturierten Rezeptdaten.
 * Wirft bei einem echten Netzwerkfehler (Server nicht erreichbar);
 * eine inhaltlich leere, aber technisch erfolgreiche Antwort (z. B. bei
 * fehlendem API-Guthaben) wird NICHT als Fehler behandelt – das
 * entscheidet die aufrufende Komponente anhand der zurückgegebenen Felder.
 */
export async function importFromLink(url) {
  const response = await fetch(`${BACKEND_URL}/extract`, {
    method: "POST",
    // "text/plain" statt "application/json": zählt als CORS-"simple request"
    // und vermeidet dadurch die browserseitige Preflight-Anfrage (OPTIONS),
    // die auf dieser Render-Instanz einen 404 zurückliefert. Der Body bleibt
    // trotzdem gültiges JSON, das Backend parst ihn entsprechend.
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`Backend antwortete mit Status ${response.status}`);
  }

  return response.json(); // { platform, title, image, ingredients, steps, warning? }
}
