import { createContext, useContext, useState, useCallback } from "react";
import * as storage from "../data/recipeStorage";

const RecipesContext = createContext(null);

/**
 * Hält den Rezept-State zentral, damit z. B. ein Favoriten-Klick auf
 * einer Karte sofort auf allen Seiten sichtbar ist (Startseite,
 * Kategorie-Seiten, Suche), statt dass jede Seite ihre eigene,
 * unabhängige Kopie des States hätte.
 */
export function RecipesProvider({ children }) {
  const [recipes, setRecipes] = useState(() => storage.getAllRecipes());

  const addRecipe = useCallback((data) => {
    const created = storage.createRecipe(data);
    setRecipes(storage.getAllRecipes());
    return created;
  }, []);

  const editRecipe = useCallback((id, data) => {
    storage.updateRecipe(id, data);
    setRecipes(storage.getAllRecipes());
  }, []);

  const removeRecipe = useCallback((id) => {
    storage.deleteRecipe(id);
    setRecipes(storage.getAllRecipes());
  }, []);

  const toggleFavorite = useCallback((id) => {
    storage.toggleFavorite(id);
    setRecipes(storage.getAllRecipes());
  }, []);

  const restoreRecipe = useCallback((recipe) => {
    storage.restoreRecipe(recipe);
    setRecipes(storage.getAllRecipes());
  }, []);

  const markAsCooked = useCallback((id) => {
    storage.markAsCooked(id);
    setRecipes(storage.getAllRecipes());
  }, []);

  return (
    <RecipesContext.Provider
      value={{ recipes, addRecipe, editRecipe, removeRecipe, toggleFavorite, restoreRecipe, markAsCooked }}
    >
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipesContext);
  if (!ctx) {
    throw new Error("useRecipes() muss innerhalb von <RecipesProvider> aufgerufen werden.");
  }
  return ctx;
}
