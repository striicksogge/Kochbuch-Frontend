// Einmalige Migration: bestehende Rezepte/Essensplan/Einkaufsliste/eigene
// Kategorien lagen bisher in localStorage - beim ersten Login nach dem
// Firebase-Umstieg werden sie automatisch nach Firestore hochgeladen.
// Rezept-IDs bleiben dabei erhalten (siehe recipeStorage.js migrateRecipe),
// damit Essensplan-/Einkaufslisten-Referenzen weiter gültig sind. Erst NACH
// bestätigtem erfolgreichem Firestore-Schreiben wird localStorage geleert -
// das war der eigentliche Zweck der ganzen Migration (Platz freigeben).
// Ein evtl. vorhandenes "images"-Feld (frühere Mehrfach-Fotos-Funktion,
// wieder entfernt - siehe recipeStorage.js) wird beim Migrieren stillschweigend
// fallengelassen, das Titelbild (image) bleibt erhalten.

import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { migrateRecipe } from "./recipeStorage";
import { WEEKDAYS } from "./mealPlanStorage";

const MIGRATION_FLAG = "kochbuch_v2_migrated_to_firestore";
const RECIPES_KEY = "kochbuch_v2_recipes";
const MEAL_PLAN_KEY = "kochbuch_v2_meal_plan";
const SHOPPING_LIST_KEY = "kochbuch_v2_shopping_list";
const CUSTOM_CATEGORIES_KEY = "kochbuch_v2_custom_categories";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function migrateLocalDataIfNeeded(uid) {
  if (localStorage.getItem(MIGRATION_FLAG) === "true") return;

  const localRecipes = readJson(RECIPES_KEY, []);
  const localMealPlan = readJson(MEAL_PLAN_KEY, null);
  const localShoppingList = readJson(SHOPPING_LIST_KEY, null);
  const localCustomCategories = readJson(CUSTOM_CATEGORIES_KEY, []);

  const nothingToMigrate =
    localRecipes.length === 0 && !localMealPlan && !localShoppingList && localCustomCategories.length === 0;
  if (nothingToMigrate) {
    localStorage.setItem(MIGRATION_FLAG, "true");
    return;
  }

  console.log(`Migriere ${localRecipes.length} Rezept(e) von localStorage nach Firestore …`);

  for (const recipe of localRecipes) {
    try {
      await migrateRecipe(uid, recipe);
    } catch (err) {
      console.error(`Migration fehlgeschlagen für Rezept "${recipe.title}" - Abbruch, wird beim nächsten Login erneut versucht:`, err);
      return; // Flag bewusst NICHT setzen
    }
  }

  const patch = {};
  if (localMealPlan) {
    const isOldFlatFormat = WEEKDAYS.some((d) => d.key in localMealPlan);
    patch.mealPlan = isOldFlatFormat ? { "0": localMealPlan } : localMealPlan;
  }
  if (localShoppingList) patch.shoppingList = localShoppingList;
  if (localCustomCategories.length > 0) patch.customCategories = localCustomCategories;

  try {
    if (Object.keys(patch).length > 0) {
      await setDoc(doc(db, "users", uid), patch, { merge: true });
    }
  } catch (err) {
    console.error("Migration von Essensplan/Einkaufsliste/Kategorien fehlgeschlagen:", err);
    return; // Rezepte sind schon migriert, Rest beim nächsten Login erneut versuchen
  }

  localStorage.setItem(MIGRATION_FLAG, "true");
  localStorage.removeItem(RECIPES_KEY);
  localStorage.removeItem(MEAL_PLAN_KEY);
  localStorage.removeItem(SHOPPING_LIST_KEY);
  localStorage.removeItem(CUSTOM_CATEGORIES_KEY);
  console.log("Migration abgeschlossen, localStorage aufgeräumt.");
}
