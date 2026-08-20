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
 * Liest eine Backup-Datei ein und übernimmt die enthaltenen Rezepte.
 * Wirft einen Fehler mit verständlicher Meldung, wenn die Datei nicht
 * zum erwarteten Format passt, statt stillschweigend kaputte Daten
 * zu übernehmen.
 *
 * mode "overwrite" (Standard): ersetzt Rezepte, Essensplan und
 * Einkaufsliste komplett durch den Inhalt der Datei.
 * mode "merge": behält die vorhandenen Rezepte und hängt die
 * importierten dahinter an; Essensplan/Einkaufsliste bleiben
 * unangetastet, da es dafür kein sinnvolles "Zusammenführen" gibt.
 * Rezepte mit einer bereits vorhandenen ID bekommen beim Merge eine
 * neue ID, damit keine Duplikate/Überschreibungen durch Zufall
 * entstehen.
 */
export async function importDataFromFile(file, mode = "overwrite") {
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

  if (mode === "merge") {
    const existing = JSON.parse(localStorage.getItem(KEYS.recipes) || "[]");
    const existingIds = new Set(existing.map((r) => r.id));
    const incoming = parsed.recipes.map((r) =>
      existingIds.has(r.id)
        ? { ...r, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()) }
        : r
    );
    localStorage.setItem(KEYS.recipes, JSON.stringify([...existing, ...incoming]));
    return incoming.length;
  }

  localStorage.setItem(KEYS.recipes, JSON.stringify(parsed.recipes));
  if (parsed.mealPlan) localStorage.setItem(KEYS.mealPlan, JSON.stringify(parsed.mealPlan));
  if (parsed.shoppingList) localStorage.setItem(KEYS.shoppingList, JSON.stringify(parsed.shoppingList));

  return parsed.recipes.length;
}
