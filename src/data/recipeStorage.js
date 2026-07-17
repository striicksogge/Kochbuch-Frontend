// Reine Datenfunktionen, unabhängig von React – leicht testbar und
// später leicht gegen eine echte Datenbank austauschbar, ohne dass
// Komponenten sich ändern müssten (nur dieser Datei-Inhalt würde sich ändern).

const STORAGE_KEY = "kochbuch_v2_recipes";

export function getAllRecipes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getRecipeById(id) {
  return getAllRecipes().find((r) => r.id === id) || null;
}

export function createRecipe(data) {
  const recipes = getAllRecipes();
  const newRecipe = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    title: data.title?.trim() || "Unbenanntes Rezept",
    description: data.description?.trim() || "",
    image: data.image?.trim() || "",
    servings: data.servings ? Number(data.servings) : 4,
    cookTime: data.cookTime?.trim() || "",
    caloriesPerServing: data.caloriesPerServing ? Number(data.caloriesPerServing) : null,
    notes: data.notes?.trim() || "",
    ingredients: data.ingredients || [],
    steps: data.steps || [],
    categories: data.categories || [],
    isFavorite: false,
    sourceUrl: data.sourceUrl || null, // gesetzt, wenn per Link importiert
    platform: data.platform || null,
  };
  recipes.unshift(newRecipe);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  return newRecipe;
}

export function updateRecipe(id, data) {
  const recipes = getAllRecipes();
  const index = recipes.findIndex((r) => r.id === id);
  if (index === -1) return null;

  recipes[index] = {
    ...recipes[index],
    title: data.title?.trim() || recipes[index].title,
    description: data.description?.trim() ?? recipes[index].description,
    image: data.image?.trim() ?? recipes[index].image,
    servings: data.servings ? Number(data.servings) : recipes[index].servings,
    cookTime: data.cookTime?.trim() ?? recipes[index].cookTime,
    caloriesPerServing:
      data.caloriesPerServing !== undefined
        ? data.caloriesPerServing
          ? Number(data.caloriesPerServing)
          : null
        : recipes[index].caloriesPerServing,
    ingredients: data.ingredients ?? recipes[index].ingredients,
    steps: data.steps ?? recipes[index].steps,
    categories: data.categories ?? recipes[index].categories,
    notes: data.notes !== undefined ? data.notes.trim() : recipes[index].notes,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  return recipes[index];
}

export function deleteRecipe(id) {
  const recipes = getAllRecipes().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

/**
 * Fügt ein zuvor gelöschtes Rezept unverändert (inkl. Original-ID)
 * wieder ein - für die Rückgängig-Funktion. Falls die ID zwischenzeitlich
 * erneut vergeben wurde (Edge-Case), wird das nicht überschrieben.
 */
export function restoreRecipe(recipe) {
  const recipes = getAllRecipes();
  if (recipes.some((r) => r.id === recipe.id)) return;
  recipes.unshift(recipe);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function toggleFavorite(id) {
  const recipes = getAllRecipes();
  const index = recipes.findIndex((r) => r.id === id);
  if (index === -1) return;
  recipes[index] = { ...recipes[index], isFavorite: !recipes[index].isFavorite };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}
