import { useState } from "react";
import { Check, ShoppingCart, X, Share2 } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { useToast } from "../context/ToastContext";
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
  const { showToast } = useToast();
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

  // Als reiner Text exportierbar (z. B. zum Einfügen in Handynotizen) -
  // bewusst kein Datei-Download: Web-Share (mit Zwischenablage-Fallback,
  // gleiches Muster wie beim Rezept-Teilen) landet auf dem Handy direkt
  // im Teilen-Menü, von wo aus sich eine Notizen-App als Ziel wählen
  // lässt, ohne den Umweg über eine heruntergeladene Datei. Bereits
  // abgehakte Zutaten werden ausgelassen - die hat man ja schon.
  function buildShareText() {
    const lines = ["Einkaufsliste (REZIPI)", ""];
    if (groupByRecipe) {
      uniqueRecipes.forEach((recipe) => {
        const items = (recipe.ingredients || [])
          .map((ing) => (typeof ing === "string" ? { name: ing } : ing))
          .filter((ing) => (ing.name || "").trim())
          .filter((ing) => !checkedKeys.has(ingredientKey(ing.name.trim(), ing.unit || "")));
        if (items.length === 0) return;
        lines.push(recipe.title);
        items.forEach((ing) => lines.push(`- ${formatIngredient(ing)}`));
        lines.push("");
      });
    } else {
      shoppingItems
        .filter((item) => !checkedKeys.has(ingredientKey(item.name, item.unit)))
        .forEach((item) => {
          const amount = item.displayAmount ? `${item.displayAmount} ${item.unit} ` : "";
          lines.push(`- ${amount}${item.name}`);
        });
    }
    return lines.join("\n").trim();
  }

  async function handleShare() {
    const text = buildShareText();
    if (!text) {
      showToast({ message: "Nichts zu teilen – alles schon abgehakt?" });
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: "Einkaufsliste", text });
      } catch {
        // Nutzer hat den Teilen-Dialog abgebrochen - kein Fehler, kein Toast.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast({ message: "Einkaufsliste kopiert" });
    } catch (err) {
      console.error(err);
      showToast({ message: "Teilen/Kopieren nicht möglich" });
    }
  }

  return (
    <div className="px-4 pb-24 pt-6 lg:pb-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Einkaufsliste</h1>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 text-xs font-medium text-olive-deep"
            >
              <Share2 size={13} /> Teilen
            </button>
            <button type="button" onClick={clearList} className="text-xs text-ink-soft underline">
              Liste leeren
            </button>
          </div>
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
