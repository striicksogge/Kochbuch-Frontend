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
