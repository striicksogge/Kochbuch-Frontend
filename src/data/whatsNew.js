// Konfiguration für das "Was ist neu?"-Popup. Beim Hinzufügen neuer
// Funktionen: WHATS_NEW.version auf ein neues, eindeutiges Datum setzen
// und items aktualisieren - dann sehen bestehende Nutzer beim nächsten
// Start automatisch die neue Liste. Neue Nutzer sehen das Popup nie
// (siehe Onboarding.jsx, das die aktuelle Version direkt als "gesehen"
// markiert, weil Onboarding die Funktionen bereits vorstellt).

const STORAGE_KEY = "kochbuch_v2_whats_new_seen_version";

export const WHATS_NEW = {
  version: "2026-08-19",
  items: [
    "Rezepte duplizieren – praktisch als Basis für eine eigene Variante.",
    "Mehrere zusätzliche Fotos pro Rezept, getrennt vom Titelbild – z. B. für dein eigenes Ergebnisfoto.",
    "Neue Merkliste „Will ich noch kochen“, unabhängig von den Favoriten (Lesezeichen-Symbol).",
  ],
};

export function hasSeenLatestWhatsNew() {
  return localStorage.getItem(STORAGE_KEY) === WHATS_NEW.version;
}

export function markWhatsNewSeen() {
  localStorage.setItem(STORAGE_KEY, WHATS_NEW.version);
}
