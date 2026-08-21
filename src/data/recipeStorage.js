// Rezept-Datenschicht: Firestore statt localStorage (users/{uid}/recipes/{id}),
// damit das bisherige harte localStorage-Limit (5-10 MB je Browser) wegfällt.
// Bewusste Entscheidung (Nutzer-Vorgabe): kein Firebase Storage (kostenpflichtiger
// Blaze-Tarif nötig) - nur EIN Titelbild pro Rezept, komprimiert direkt als
// Data-URL im Firestore-Dokument gespeichert. Firestore-Dokumente haben ein
// hartes 1-MB-Limit (gilt immer, unabhängig vom Tarif); die bestehende
// Foto-Kompression (imageUtils.js, max. 1000px Breite, JPEG q=0.8) hält ein
// einzelnes Titelbild komfortabel darunter. Die frühere "mehrere zusätzliche
// Fotos"-Funktion wurde deshalb bewusst wieder entfernt.

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAllCategoriesIncludingCustom } from "./categories";

function recipesCol(uid) {
  return collection(db, "users", uid, "recipes");
}

function recipeDocRef(uid, id) {
  return doc(db, "users", uid, "recipes", id);
}

function newId() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
}

/**
 * Live-Abo auf alle Rezepte eines Nutzers - jede Änderung (auch von
 * einem anderen eingeloggten Gerät) kommt automatisch als neuer Aufruf
 * von callback rein, kein manuelles Neuladen nötig. Gibt eine
 * Unsubscribe-Funktion zurück.
 */
export function subscribeToRecipes(uid, callback, onError) {
  return onSnapshot(
    recipesCol(uid),
    (snap) => {
      const recipes = snap.docs.map((d) => d.data());
      recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(recipes);
    },
    (err) => {
      console.error("Rezepte-Abo fehlgeschlagen:", err);
      onError?.(err);
    }
  );
}

export async function createRecipe(uid, data) {
  const id = newId();
  const newRecipe = {
    id,
    createdAt: new Date().toISOString(),
    title: data.title?.trim() || "Unbenanntes Rezept",
    description: data.description?.trim() || "",
    image: data.image?.trim() || "",
    servings: data.servings ? Number(data.servings) : 4,
    cookTime: data.cookTime?.trim() || "",
    caloriesPerServing: data.caloriesPerServing ? Number(data.caloriesPerServing) : null,
    notes: data.notes?.trim() || "",
    lastCookedAt: null,
    cookCount: 0,
    ingredients: data.ingredients || [],
    steps: data.steps || [],
    categories: data.categories || [],
    isFavorite: false,
    sourceUrl: data.sourceUrl || null,
    platform: data.platform || null,
  };
  await setDoc(recipeDocRef(uid, id), newRecipe);
  return newRecipe;
}

export async function updateRecipe(uid, id, data, currentRecipe) {
  const merged = {
    ...currentRecipe,
    title: data.title?.trim() || currentRecipe.title,
    description: data.description?.trim() ?? currentRecipe.description,
    image: data.image?.trim() ?? currentRecipe.image,
    servings: data.servings ? Number(data.servings) : currentRecipe.servings,
    cookTime: data.cookTime?.trim() ?? currentRecipe.cookTime,
    caloriesPerServing:
      data.caloriesPerServing !== undefined
        ? data.caloriesPerServing
          ? Number(data.caloriesPerServing)
          : null
        : currentRecipe.caloriesPerServing,
    ingredients: data.ingredients ?? currentRecipe.ingredients,
    steps: data.steps ?? currentRecipe.steps,
    categories: data.categories ?? currentRecipe.categories,
    notes: data.notes !== undefined ? data.notes.trim() : currentRecipe.notes,
  };
  delete merged.images; // altes Feld aus der entfernten Mehrfach-Fotos-Funktion, falls vorhanden
  await setDoc(recipeDocRef(uid, id), merged);
  return merged;
}

export async function deleteRecipe(uid, id) {
  await deleteDoc(recipeDocRef(uid, id));
}

/** Für die Rückgängig-Funktion nach dem Löschen - Rezept unverändert (inkl. Original-ID) wieder anlegen. */
export async function restoreRecipe(uid, recipe) {
  const existing = await getDoc(recipeDocRef(uid, recipe.id));
  if (existing.exists()) return; // ID zwischenzeitlich erneut vergeben (Edge-Case) - nicht überschreiben
  await setDoc(recipeDocRef(uid, recipe.id), recipe);
}

export async function toggleFavorite(uid, recipe) {
  await updateDoc(recipeDocRef(uid, recipe.id), { isFavorite: !recipe.isFavorite });
}

export async function markAsCooked(uid, recipe) {
  await updateDoc(recipeDocRef(uid, recipe.id), {
    lastCookedAt: new Date().toISOString(),
    cookCount: (recipe.cookCount || 0) + 1,
  });
}

/** Legt eine Kopie eines Rezepts als Basis für eine Variante an - eigene ID, ohne Favorit/Kochstatus/Quelle des Originals. */
export async function duplicateRecipe(uid, original) {
  const id = newId();
  const copy = {
    ...original,
    id,
    title: `${original.title} (Kopie)`,
    createdAt: new Date().toISOString(),
    lastCookedAt: null,
    cookCount: 0,
    isFavorite: false,
    sourceUrl: null,
    platform: null,
  };
  await setDoc(recipeDocRef(uid, id), copy);
  return copy;
}

/**
 * Für die einmalige Migration von localStorage (siehe data/migration.js):
 * übernimmt ein Rezept unverändert inkl. Original-ID (im Gegensatz zu
 * createRecipe, das immer eine neue ID vergibt) - damit bestehende
 * Essensplan-/Einkaufslisten-Referenzen auf die alte ID gültig bleiben.
 */
export async function migrateRecipe(uid, recipe) {
  const migrated = { ...recipe };
  delete migrated.images; // Mehrfach-Fotos-Feld gibt es nicht mehr, siehe Datei-Kommentar oben
  await setDoc(recipeDocRef(uid, recipe.id), migrated);
  return migrated;
}

/**
 * Sucht ein bestehendes Rezept mit demselben Titel (getrimmt,
 * Groß-/Kleinschreibung ignoriert) in einer bereits geladenen
 * Rezeptliste - für die Dopplungs-Warnung beim Speichern (siehe
 * AddRecipe.jsx/RecipeForm.jsx). excludeId lässt beim Bearbeiten das
 * Rezept selbst außen vor. Reine Funktion, kein Firestore-Zugriff -
 * die Rezeptliste liegt über RecipesContext (Live-Abo) schon im
 * Speicher, ein zusätzlicher Lesezugriff wäre unnötig.
 */
export function findRecipeByTitle(recipes, title, excludeId = null) {
  const normalized = (title || "").trim().toLowerCase();
  if (!normalized) return null;
  return recipes.find((r) => r.id !== excludeId && r.title.trim().toLowerCase() === normalized) || null;
}

/**
 * Einmalige Datenbereinigung: entfernt Kategorie-Tags aus Bestandsdaten,
 * die inzwischen aus categories.js entfernt wurden (z. B. alte Kategorien
 * wie „Vegan"/„Partyfood") und in der Auswahl-UI ohnehin nicht mehr
 * anklickbar sind. Läuft einmal nach dem ersten Laden der Rezepte,
 * schreibt nur Dokumente, bei denen sich tatsächlich etwas ändert.
 */
export async function cleanupStaleCategories(uid, recipes) {
  const validNames = getAllCategoriesIncludingCustom();
  const updates = recipes
    .map((r) => {
      const validCategories = (r.categories || []).filter((c) => validNames.includes(c));
      if (validCategories.length === (r.categories || []).length) return null;
      return { id: r.id, categories: validCategories };
    })
    .filter(Boolean);
  await Promise.all(updates.map((u) => updateDoc(recipeDocRef(uid, u.id), { categories: u.categories })));
  return updates.length > 0;
}
