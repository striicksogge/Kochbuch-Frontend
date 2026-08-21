const KEY = "kochbuch_v2_sidebar_collapsed";

/**
 * Merkt sich den Ein-/Ausgeklappt-Zustand der Desktop-Seitenleiste
 * geräte-/browserspezifisch (localStorage), analog zu data/theme.js.
 * Nur ab Desktop-Breite relevant, siehe components/Sidebar.jsx.
 */
export function isSidebarCollapsed() {
  return localStorage.getItem(KEY) === "1";
}

export function setSidebarCollapsed(collapsed) {
  localStorage.setItem(KEY, collapsed ? "1" : "0");
}
