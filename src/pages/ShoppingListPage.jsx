import { useState } from "react";
import { Check, ShoppingCart, X } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { buildShoppingList } from "../data/shoppingList";
import { formatIngredient } from "../data/ingredients";
import {
  getShoppingListState,
  saveSelectedRecipeIds,
  saveCheckedKeys,
} from "../data/shoppingListStorage";

/**
 * Einkaufsliste: zeigt nur noch die Zutaten, keine Rezept-Auswahl mehr -
 * die passiert jetzt ausschließlich über den Essensplan ("Wochen-
 * Einkaufsliste erstellen") oder den "Zur Einkaufsliste"-Button auf der
 * Rezept-Detailseite. Grund: eine zusätzliche Rezeptübersicht hier war
 * unübersichtlich, wenn man eigentlich nur einkaufen gehen wollte.
 * Standardmäßig alle Zutaten gebündelt (gleiche Zutat über mehrere
 * Rezepte hinweg zusammengefasst), optional nach Rezept gruppiert -
 * dann ungebündelt, jedes Rezept mit seiner eigenen Zutatenliste.
 * Abhak-Status ist in beiden Ansichten identisch (Schlüssel
 * `name|unit`), bleibt also beim Umschalten erhalten.
 */
export default function ShoppingListPage() {
  const { recipes } = useRecipes();
  const initial = getShoppingListState();

  const [selectedIds, setSelectedIds] = useState(
    initial.selectedRecipeIds.filter((id) => recipes.some((r) => r.id === id))
  );
  const [checkedKeys, setCheckedKeys] = useState(new Set(initial.checkedKeys));
  const [groupByRecipe, setGroupByRecipe] = useState(false);

  function toggleChecked(key) {
    const next = new Set(checkedKeys);
    next.has(key) ? next.delete(key) : next.add(key);
    setCheckedKeys(next);
    saveCheckedKeys([...next]);
  }

  function clearList() {
    setSelectedIds([]);
    setCheckedKeys(new Set());
    saveSelectedRecipeIds([]);
    saveCheckedKeys([]);
  }

  function removeRecipeFromList(recipeId) {
    const next = selectedIds.filter((id) => id !== recipeId);
    setSelectedIds(next);
    saveSelectedRecipeIds(next);
  }

  // Wichtig: NICHT recipes.filter(...) verwenden - das würde ein Rezept,
  // das zweimal in selectedIds steht (z. B. aus dem Essensplan, zweimal
  // in der Woche eingeplant), auf ein einziges Vorkommen zusammenziehen.
  // Stattdessen jedes Vorkommen einzeln abbilden, damit buildShoppingList
  // die Zutaten korrekt doppelt zählt.
  const selectedRecipes = selectedIds.map((sid) => recipes.find((r) => r.id === sid)).filter(Boolean);
  const uniqueRecipes = [...new Map(selectedRecipes.map((r) => [r.id, r])).values()];
  const shoppingItems = buildShoppingList(selectedRecipes);

  function ingredientKey(name, unit) {
    return `${name.toLowerCase()}|${(unit || "").toLowerCase()}`;
  }

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Einkaufsliste</h1>
        {selectedIds.length > 0 && (
          <button type="button" onClick={clearList} className="text-xs text-ink-soft underline">
            Liste leeren
          </button>
        )}
      </div>

      {selectedIds.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <ShoppingCart size={36} strokeWidth={1.5} className="mb-3 text-olive" />
          <p className="text-sm text-ink-soft">
            Noch nichts auf der Liste. Füge Rezepte über den Essensplan („Wochen-
            Einkaufsliste erstellen") oder direkt auf der Rezept-Detailseite hinzu.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              {uniqueRecipes.length} Rezept{uniqueRecipes.length !== 1 && "e"} ·{" "}
              {shoppingItems.length} Zutaten
            </p>
            <div className="flex shrink-0 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setGroupByRecipe(false)}
                className={`rounded-[calc(var(--radius-chip)-2px)] px-2.5 py-1 font-medium ${
                  !groupByRecipe ? "bg-olive text-cream" : "text-ink-soft"
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setGroupByRecipe(true)}
                className={`rounded-[calc(var(--radius-chip)-2px)] px-2.5 py-1 font-medium ${
                  groupByRecipe ? "bg-olive text-cream" : "text-ink-soft"
                }`}
              >
                Nach Rezept
              </button>
            </div>
          </div>

          {groupByRecipe ? (
            <div className="mt-3 space-y-4">
              {uniqueRecipes.map((recipe) => (
                <div key={recipe.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="font-display text-sm font-medium text-ink">{recipe.title}</p>
                    <button
                      type="button"
                      onClick={() => removeRecipeFromList(recipe.id)}
                      aria-label={`${recipe.title} von der Liste entfernen`}
                      className="text-ink-soft"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-2">
                    {(recipe.ingredients || []).map((ing, i) => {
                      const name = (typeof ing === "string" ? ing : ing.name || "").trim();
                      if (!name) return null;
                      const unit = typeof ing === "string" ? "" : ing.unit || "";
                      const key = ingredientKey(name, unit);
                      const isChecked = checkedKeys.has(key);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleChecked(key)}
                          className="flex w-full items-center gap-3 border-b border-sand-line px-2 py-2.5 text-left last:border-b-0"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              isChecked ? "border-olive bg-olive text-cream" : "border-sand-line"
                            }`}
                          >
                            {isChecked && <Check size={13} strokeWidth={3} />}
                          </span>
                          <span className={`text-sm ${isChecked ? "text-ink-soft line-through" : "text-ink"}`}>
                            {formatIngredient(typeof ing === "string" ? { name: ing } : ing)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-2">
              {shoppingItems.map((item) => {
                const key = ingredientKey(item.name, item.unit);
                const isChecked = checkedKeys.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleChecked(key)}
                    className="flex w-full items-center gap-3 border-b border-sand-line px-2 py-2.5 text-left last:border-b-0"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isChecked ? "border-olive bg-olive text-cream" : "border-sand-line"
                      }`}
                    >
                      {isChecked && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span className={`text-sm ${isChecked ? "text-ink-soft line-through" : "text-ink"}`}>
                      {item.displayAmount && (
                        <span className="font-medium">
                          {item.displayAmount} {item.unit}{" "}
                        </span>
                      )}
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
