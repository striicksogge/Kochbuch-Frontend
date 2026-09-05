// Nutzergenerierte, zusätzliche Kategorien (über "Weiteres" > "Kategorien
// hinzufügen"). Liegt als Teil des users/{uid}-Dokuments in Firestore
// (siehe data/userDoc.js), synct also über Login mit auf allen Geräten.

import { getUserData, patchUserDoc } from "./userDoc";

export function getCustomCategories() {
  return getUserData().customCategories || [];
}

/** Fügt eine neue Kategorie hinzu. Gibt false zurück bei leerem Namen oder Duplikat. */
export function addCustomCategory(name) {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const current = getCustomCategories();
  if (current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return false;
  patchUserDoc({ customCategories: [...current, trimmed] });
  return true;
}

export function removeCustomCategory(name) {
  patchUserDoc({ customCategories: getCustomCategories().filter((c) => c !== name) });
}

/**
 * Benennt eine bestehende eigene Kategorie um. Gibt false zurück bei
 * leerem neuem Namen, unbekanntem alten Namen oder wenn der neue Name
 * (außer bei reiner Groß-/Kleinschreibungs-Änderung) schon existiert.
 * Rezepte, die die alte Kategorie tragen, werden separat über
 * recipeStorage.js renameCategoryInRecipes() aktualisiert - diese
 * Funktion ändert nur die Kategorien-Liste selbst.
 */
export function renameCustomCategory(oldName, newName) {
  const trimmed = newName.trim();
  if (!trimmed) return false;
  const current = getCustomCategories();
  if (!current.includes(oldName)) return false;
  const collides = current.some(
    (c) => c !== oldName && c.toLowerCase() === trimmed.toLowerCase()
  );
  if (collides) return false;
  patchUserDoc({ customCategories: current.map((c) => (c === oldName ? trimmed : c)) });
  return true;
}
