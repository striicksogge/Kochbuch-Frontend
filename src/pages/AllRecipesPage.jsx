import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ListChecks, X, Trash2, Share2, ShoppingCart } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { useToast } from "../context/ToastContext";
import { getShoppingListState, saveSelectedRecipeIds } from "../data/shoppingListStorage";
import RecipeCard from "../components/RecipeCard";

/**
 * Zeigt wirklich ALLE Rezepte im Grid (im Gegensatz zu Home, wo nur
 * Ausschnitte/Slider zu sehen sind). Erreichbar über "Alle" beim
 * "Zuletzt hinzugefügt"-Bereich auf der Startseite.
 * Der frühere Export/Import-Zugang fürs Backup ist in die "Weiteres"-
 * Bottom-Nav (WeiteresMenu.jsx) umgezogen, um ihn nicht doppelt
 * vorzuhalten.
 *
 * Auswahl-Modus: "Auswählen" antippen zeigt Häkchen auf den Karten
 * (siehe RecipeCard.jsx) statt zur Detailseite zu verlinken, eine feste
 * Aktionsleiste unten bietet dann Löschen/Teilen/Zur Einkaufsliste für
 * alle ausgewählten Rezepte auf einmal.
 */
export default function AllRecipesPage() {
  const { recipes, removeRecipe, restoreRecipe } = useRecipes();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState("newest");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const sorted = [...recipes].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title, "de");
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  function toggleSelectionMode() {
    setSelectionMode((v) => !v);
    setSelectedIds(new Set());
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedRecipes = sorted.filter((r) => selectedIds.has(r.id));

  function handleBulkDelete() {
    const confirmed = window.confirm(
      `${selectedRecipes.length} Rezept${selectedRecipes.length !== 1 ? "e" : ""} löschen?`
    );
    if (!confirmed) return;

    const deleted = selectedRecipes;
    deleted.forEach((r) => removeRecipe(r.id));
    setSelectedIds(new Set());
    setSelectionMode(false);
    showToast({
      message: `${deleted.length} Rezept${deleted.length !== 1 ? "e" : ""} gelöscht`,
      actionLabel: "Rückgängig",
      onAction: () => deleted.forEach((r) => restoreRecipe(r)),
    });
  }

  async function handleBulkShare() {
    const lines = selectedRecipes.map((r) => (r.sourceUrl ? `${r.title}: ${r.sourceUrl}` : r.title));
    const text = lines.join("\n");
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // Nutzer hat den Teilen-Dialog abgebrochen - kein Fehler, kein Toast.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast({ message: "Liste kopiert" });
    } catch (err) {
      console.error(err);
      showToast({ message: "Teilen/Kopieren nicht möglich" });
    }
  }

  function handleBulkAddToShoppingList() {
    const { selectedRecipeIds } = getShoppingListState();
    const newIds = selectedRecipes.map((r) => r.id).filter((id) => !selectedRecipeIds.includes(id));
    saveSelectedRecipeIds([...selectedRecipeIds, ...newIds]);
    showToast({
      message:
        newIds.length > 0
          ? `${newIds.length} Rezept${newIds.length !== 1 ? "e" : ""} zur Einkaufsliste hinzugefügt`
          : "War schon alles in der Einkaufsliste",
    });
    setSelectedIds(new Set());
    setSelectionMode(false);
  }

  return (
    <div className={selectionMode ? "px-4 pb-32 pt-4" : "px-4 pb-24 pt-4"}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            aria-label="Zurück zur Startseite"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display text-xl font-semibold text-ink">Alle Rezepte</h1>
        </div>
        {recipes.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectionMode}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-3 py-1.5 text-xs font-medium text-ink"
          >
            {selectionMode ? (
              <>
                <X size={14} /> Abbrechen
              </>
            ) : (
              <>
                <ListChecks size={14} /> Auswählen
              </>
            )}
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {selectionMode
            ? `${selectedIds.size} ausgewählt`
            : `${recipes.length} Rezept${recipes.length !== 1 ? "e" : ""}`}
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-3 py-1.5 text-xs text-ink"
        >
          <option value="newest">Neueste zuerst</option>
          <option value="title">Titel A–Z</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-soft">Noch keine Rezepte im Kochbuch.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
          {sorted.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              selectionMode={selectionMode}
              selected={selectedIds.has(recipe.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {selectionMode && selectedIds.size > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-20 border-t border-sand-line bg-cream-card/95 px-4 py-3 backdrop-blur"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
        >
          <div className="mx-auto flex max-w-md items-center justify-around gap-2">
            <button
              type="button"
              onClick={handleBulkDelete}
              className="flex flex-col items-center gap-1 text-xs font-medium text-red-700"
            >
              <Trash2 size={20} />
              Löschen
            </button>
            <button
              type="button"
              onClick={handleBulkShare}
              className="flex flex-col items-center gap-1 text-xs font-medium text-ink"
            >
              <Share2 size={20} />
              Teilen
            </button>
            <button
              type="button"
              onClick={handleBulkAddToShoppingList}
              className="flex flex-col items-center gap-1 text-xs font-medium text-ink"
            >
              <ShoppingCart size={20} />
              Zur Einkaufsliste
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
