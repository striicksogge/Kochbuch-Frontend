// Persönlicher, standardmäßig AUS-Schalter: lädt das TikTok/Pinterest-
// Vorschaubild beim Import dauerhaft herunter (Base64, über den Backend-
// Endpunkt) statt nur den Link zu übernehmen. Bewusste Ausnahme von der
// sonst geltenden Regel (siehe ImageDisclaimerBanner.jsx,
// ../../../Doku 00_PROJECT/decision.md "Verworfene Ansätze") - auf
// expliziten Nutzerwunsch für den persönlichen Gebrauch, rechtliches
// Risiko (TikTok-AGB) liegt bewusst beim Nutzer selbst.
//
// Nur temporär gedacht (Nutzer-Vorgabe) - bewusst als eigenständiges,
// klar abgegrenztes Modul gehalten (eigene Datei, eigener Toggle im
// Weiteres-Menü, ein einziger Parameter an importFromLink), damit sich
// die ganze Funktion bei Bedarf wieder sauber entfernen lässt. Siehe
// ../../../Doku 01_TASKS/task.md für die vollständige Liste der Stellen,
// die dafür angefasst wurden.

const STORAGE_KEY = "kochbuch_v2_embed_thumbnails";

export function isThumbnailDownloadEnabled() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setThumbnailDownloadEnabled(enabled) {
  localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}
