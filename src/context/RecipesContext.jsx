import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import * as storage from "../data/recipeStorage";
import { initUserDoc, resetUserDoc } from "../data/userDoc";
import { migrateLocalDataIfNeeded } from "../data/migration";

const RecipesContext = createContext(null);

/**
 * Hält den Rezept-State zentral (Firestore-Live-Abo, siehe
 * recipeStorage.js subscribeToRecipes) - eine Änderung ist dadurch sofort
 * überall in der App sichtbar, auch von einem anderen eingeloggten Gerät.
 *
 * `dataReady` wird erst true, nachdem beim Login (a) eine evtl. nötige
 * Migration alter localStorage-Daten abgeschlossen, (b) die kleinen
 * Nutzdaten (Essensplan/Einkaufsliste/eigene Kategorien, siehe
 * data/userDoc.js) geladen UND (c) der erste Rezepte-Schnappschuss
 * angekommen ist - App.jsx zeigt bis dahin einen Ladezustand, damit
 * Seiten, die z. B. getMealPlan() synchron in einem useState-Initializer
 * aufrufen (MealPlanPage.jsx), nicht mit veralteten Default-Werten starten.
 */
export function RecipesProvider({ children }) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [dataReady, setDataReady] = useState(false);
  const cleanupRanRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setDataReady(false);
      resetUserDoc();
      cleanupRanRef.current = false;
      return;
    }

    let cancelled = false;
    let unsubscribe = null;
    setDataReady(false);

    (async () => {
      try {
        await migrateLocalDataIfNeeded(user.uid);
        await initUserDoc(user.uid);
      } catch (err) {
        console.error("Laden der Nutzdaten fehlgeschlagen:", err);
      }
      if (cancelled) return;

      unsubscribe = storage.subscribeToRecipes(user.uid, (recs) => {
        setRecipes(recs);
        setDataReady(true);
        if (!cleanupRanRef.current) {
          cleanupRanRef.current = true;
          storage.cleanupStaleCategories(user.uid, recs).catch((err) => console.error(err));
        }
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user]);

  const addRecipe = useCallback(
    (data) => storage.createRecipe(user.uid, data),
    [user]
  );

  const editRecipe = useCallback(
    (id, data) => {
      const current = recipes.find((r) => r.id === id);
      return storage.updateRecipe(user.uid, id, data, current);
    },
    [user, recipes]
  );

  const removeRecipe = useCallback(
    (id) => storage.deleteRecipe(user.uid, id),
    [user]
  );

  const toggleFavorite = useCallback(
    (id) => {
      const recipe = recipes.find((r) => r.id === id);
      return recipe ? storage.toggleFavorite(user.uid, recipe) : Promise.resolve();
    },
    [user, recipes]
  );

  const restoreRecipe = useCallback(
    (recipe) => storage.restoreRecipe(user.uid, recipe),
    [user]
  );

  const markAsCooked = useCallback(
    (id) => {
      const recipe = recipes.find((r) => r.id === id);
      return recipe ? storage.markAsCooked(user.uid, recipe) : Promise.resolve();
    },
    [user, recipes]
  );

  const toggleWantToCook = useCallback(
    (id) => {
      const recipe = recipes.find((r) => r.id === id);
      return recipe ? storage.toggleWantToCook(user.uid, recipe) : Promise.resolve();
    },
    [user, recipes]
  );

  const duplicateRecipe = useCallback(
    (id) => {
      const recipe = recipes.find((r) => r.id === id);
      return recipe ? storage.duplicateRecipe(user.uid, recipe) : Promise.resolve(null);
    },
    [user, recipes]
  );

  return (
    <RecipesContext.Provider
      value={{
        recipes,
        dataReady,
        addRecipe,
        editRecipe,
        removeRecipe,
        toggleFavorite,
        restoreRecipe,
        markAsCooked,
        toggleWantToCook,
        duplicateRecipe,
      }}
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
