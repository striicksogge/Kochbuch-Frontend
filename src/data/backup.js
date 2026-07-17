// Backup-Funktionen: alle relevanten localStorage-Daten der App
// (Rezepte, Essensplan, Einkaufslisten-Auswahl) als eine JSON-Datei
// exportieren bzw. wieder einspielen.

const KEYS = {
  recipes: "kochbuch_v2_recipes",
  mealPlan: "kochbuch_v2_meal_plan",
  shoppingList: "kochbuch_v2_shopping_list",
};

export function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    appVersion: "kochbuch-v2",
    recipes: JSON.parse(localStorage.getItem(KEYS.recipes) || "[]"),
    mealPlan: JSON.parse(localStorage.getItem(KEYS.mealPlan) || "null"),
    shoppingList: JSON.parse(localStorage.getItem(KEYS.shoppingList) || "null"),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);

  const a = document.createElement("a");
  a.href = url;
  a.download = `kochbuch-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return payload.recipes.length;
}

/**
 * Liest eine Backup-Datei ein und überschreibt die aktuellen Daten.
 * Wirft einen Fehler mit verständlicher Meldung, wenn die Datei nicht
 * zum erwarteten Format passt, statt stillschweigend kaputte Daten
 * zu übernehmen.
 */
export async function importDataFromFile(file) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Die Datei ist kein gültiges JSON.");
  }

  if (!Array.isArray(parsed.recipes)) {
    throw new Error("Diese Datei sieht nicht wie ein Kochbuch-Backup aus.");
  }

  localStorage.setItem(KEYS.recipes, JSON.stringify(parsed.recipes));
  if (parsed.mealPlan) localStorage.setItem(KEYS.mealPlan, JSON.stringify(parsed.mealPlan));
  if (parsed.shoppingList) localStorage.setItem(KEYS.shoppingList, JSON.stringify(parsed.shoppingList));

  return parsed.recipes.length;
}
