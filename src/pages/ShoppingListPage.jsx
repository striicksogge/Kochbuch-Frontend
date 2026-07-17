import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { buildShoppingList } from "../data/shoppingList";
import {
  getShoppingListState,
  saveSelectedRecipeIds,
  saveCheckedKeys,
} from "../data/shoppingListStorage";

/**
 * Einkaufsliste: Rezepte auswählen, App fasst gleiche Zutaten
 * zusammen. Auswahl + Abhak-Status bleiben über localStorage erhalten,
 * damit man die Liste z. B. beim Einkaufen zwischendurch verlassen kann.
 */
export default function ShoppingListPage() {
  const { recipes } = useRecipes();
  const initial = getShoppingListState();

  const [selectedIds, setSelectedIds] = useState(
    initial.selectedRecipeIds.filter((id) => recipes.some((r) => r.id === id))
  );
  const [checkedKeys, setCheckedKeys] = useState(new Set(initial.checkedKeys));

  function toggleRecipeSelection(id) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setSelectedIds(next);
    saveSelectedRecipeIds(next);
  }

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

  const selectedRecipes = recipes.filter((r) => selectedIds.includes(r.id));
  const shoppingItems = buildShoppingList(selectedRecipes);

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

      {/* Rezeptauswahl */}
      <section className="mt-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
          Rezepte auswählen
        </p>
        {recipes.length === 0 ? (
          <p className="text-sm text-ink-soft">Noch keine Rezepte im Kochbuch.</p>
        ) : (
          <div className="space-y-2">
            {recipes.map((recipe) => {
              const isSelected = selectedIds.includes(recipe.id);
              return (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => toggleRecipeSelection(recipe.id)}
                  className={`flex w-full items-center gap-3 rounded-[var(--radius-card)] border p-2.5 text-left ${
                    isSelected ? "border-olive bg-olive/10" : "border-sand-line bg-cream-card"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isSelected ? "border-olive bg-olive text-cream" : "border-sand-line"
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </span>
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="h-10 w-10 shrink-0 rounded-lg bg-sand-line" />
                  )}
                  <span className="truncate text-sm text-ink">{recipe.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Kombinierte Liste */}
      {shoppingItems.length > 0 && (
        <section className="mt-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
            {selectedRecipes.length} Rezept{selectedRecipes.length !== 1 && "e"} · {shoppingItems.length} Zutaten
          </p>
          <div className="rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-2">
            {shoppingItems.map((item) => {
              const key = `${item.name.toLowerCase()}|${item.unit.toLowerCase()}`;
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
        </section>
      )}

      {selectedIds.length === 0 && recipes.length > 0 && (
        <div className="mt-16 flex flex-col items-center text-center">
          <ShoppingCart size={36} strokeWidth={1.5} className="mb-3 text-olive" />
          <p className="text-sm text-ink-soft">
            Wähle oben ein oder mehrere Rezepte aus – die Einkaufsliste wird automatisch erstellt.
          </p>
        </div>
      )}
    </div>
  );
}
