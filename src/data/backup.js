// Backup-Funktionen: Rezepte (aus dem Firestore-Live-Abo, siehe
// RecipesContext) + Essensplan/Einkaufsliste (siehe data/userDoc.js) als
// eine JSON-Datei exportieren bzw. wieder einspielen. Import schreibt
// jetzt nach Firestore statt localStorage.

import { getUserData, patchUserDoc } from "./userDoc";
import { migrateRecipe, deleteRecipe } from "./recipeStorage";

export function exportData(recipes) {
  const payload = {
    exportedAt: new Date().toISOString(),
    appVersion: "kochbuch-v2",
    recipes,
    mealPlan: getUserData().mealPlan || null,
    shoppingList: getUserData().shoppingList || null,
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
export async function importDataFromFile(uid, file, existingRecipes, mode = "overwrite") {
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
    const existingIds = new Set(existingRecipes.map((r) => r.id));
    let count = 0;
    for (const r of parsed.recipes) {
      const recipe = existingIds.has(r.id)
        ? { ...r, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()) }
        : r;
      await migrateRecipe(uid, recipe);
      count++;
    }
    return count;
  }

  await Promise.all(existingRecipes.map((r) => deleteRecipe(uid, r.id)));
  for (const r of parsed.recipes) {
    await migrateRecipe(uid, r);
  }
  if (parsed.mealPlan || parsed.shoppingList) {
    patchUserDoc({
      ...(parsed.mealPlan ? { mealPlan: parsed.mealPlan } : {}),
      ...(parsed.shoppingList ? { shoppingList: parsed.shoppingList } : {}),
    });
  }

  return parsed.recipes.length;
}
