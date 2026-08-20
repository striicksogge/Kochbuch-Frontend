// Nutzergenerierte, zusätzliche Kategorien (über "Weiteres" > "Kategorien
// hinzufügen"). Rein clientseitig in localStorage, kein Abgleich mit dem
// Backend nötig - genau wie die restlichen Bestandsdaten der App.

const STORAGE_KEY = "kochbuch_v2_custom_categories";

export function getCustomCategories() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** Fügt eine neue Kategorie hinzu. Gibt false zurück bei leerem Namen oder Duplikat. */
export function addCustomCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const current = getCustomCategories();
  if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, trimmed]));
  return true;
}

export function removeCustomCategory(name) {
  const current = getCustomCategories();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter((c) => c !== name)));
}
