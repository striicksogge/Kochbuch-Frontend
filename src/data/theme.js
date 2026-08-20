// Darstellung: "system" (Standard, folgt der Geräteeinstellung),
// "light" oder "dark" (erzwungen). Umgesetzt über ein data-theme-
// Attribut auf <html>, das die Farb-Variablen in index.css umdefiniert
// - siehe dort für die eigentliche Farbpalette.

const STORAGE_KEY = "kochbuch_v2_theme";

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) || "system";
}

/** Setzt data-theme auf <html> passend zur gespeicherten (oder übergebenen) Einstellung. */
export function applyTheme(theme = getTheme()) {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") {
    root.setAttribute("data-theme", theme);
  } else {
    root.removeAttribute("data-theme");
  }
}

export function setTheme(theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}
