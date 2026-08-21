import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ListChecks,
  X,
  Trash2,
  Share2,
  ShoppingCart,
  Search,
  Loader2,
  Flame,
  Recycle,
} from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { useToast } from "../context/ToastContext";
import { getShoppingListState, saveSelectedRecipeIds } from "../data/shoppingListStorage";
import { searchRecipes } from "../data/searchApi";
import RecipeCard from "../components/RecipeCard";
import CategorySelector from "../components/CategorySelector";

const EXAMPLE_QUERIES = ["Irgendwas mit Hähnchen und Reis", "Pasta mit Spinat", "Schnell für heute"];
const LEFTOVER_EXAMPLES = ["Zucchini, Feta, Reis", "Hackfleisch, Tomaten", "Kartoffeln, Frühlingszwiebeln"];
const LOW_CALORIE_THRESHOLD = 600;

/**
 * Zeigt wirklich ALLE Rezepte im Grid (im Gegensatz zu Home, wo nur
 * Ausschnitte/Slider zu sehen sind), UND die vollständige Suche
 * (vormals eigene SearchPage.jsx) - beides an einem Ort, damit die
 * Suchleiste auf Home direkt hierher führt statt auf eine separate
 * Zwischenseite (siehe SearchBar.jsx). Der frühere Export/Import-
 * Zugang fürs Backup ist in die "Weiteres"-Bottom-Nav (WeiteresMenu.jsx)
 * umgezogen, um ihn nicht doppelt vorzuhalten.
 *
 * Auswahl-Modus: "Auswählen" antippen zeigt Häkchen auf den Karten
 * (siehe RecipeCard.jsx) statt zur Detailseite zu verlinken, eine feste
 * Aktionsleiste unten bietet dann Löschen/Teilen/Zur Einkaufsliste für
 * alle ausgewählten Rezepte auf einmal - wirkt auf die aktuell
 * angezeigte (ggf. gefilterte/gesuchte) Liste.
 */
export default function AllRecipesPage() {
  const { recipes, removeRecipe, restoreRecipe } = useRecipes();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState("newest");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Suche + Kategorie-Filterung + Reste-Verwertung, identisch zur
  // früheren SearchPage.jsx. "Reste verwerten" nutzt denselben
  // KI-Such-Endpunkt wie die normale Suche, formuliert die Anfrage davor
  // nur passend um.
  const [searchMode, setSearchMode] = useState("search"); // "search" | "leftovers"
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [aiResults, setAiResults] = useState(null); // null = keine KI-Suche ausgeführt
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [lowCalorieOnly, setLowCalorieOnly] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim() || recipes.length === 0) return;

    const effectiveQuery =
      searchMode === "leftovers"
        ? `Ich habe folgende Zutaten übrig, die ich unbedingt verbrauchen möchte: ${query}. Finde Rezepte, die möglichst viele dieser Zutaten nutzen, auch wenn noch ein paar andere Zutaten dazu nötig sind.`
        : query;

    setIsSearching(true);
    setSearchError("");
    try {
      const matchingIds = await searchRecipes(effectiveQuery, recipes);
      const ordered = matchingIds.map((id) => recipes.find((r) => r.id === id)).filter(Boolean);
      setAiResults(ordered);
    } catch (err) {
      console.error(err);
      setSearchError("Suche fehlgeschlagen (Server nicht erreichbar oder überlastet). Bitte erneut versuchen.");
    } finally {
      setIsSearching(false);
    }
  }

  function clearAiSearch() {
    setQuery("");
    setAiResults(null);
    setSearchError("");
  }

  function switchSearchMode(newMode) {
    setSearchMode(newMode);
    clearAiSearch();
  }

  const isFiltering = aiResults !== null || selectedCategories.length > 0 || lowCalorieOnly;

  const displayed = useMemo(() => {
    let base = aiResults !== null ? aiResults : recipes;
    if (selectedCategories.length > 0) {
      base = base.filter((r) => selectedCategories.some((c) => (r.categories || []).includes(c)));
    }
    if (lowCalorieOnly) {
      base = base.filter(
        (r) => typeof r.caloriesPerServing === "number" && r.caloriesPerServing < LOW_CALORIE_THRESHOLD
      );
    }
    // Bei einer aktiven KI-Suche bleibt deren Relevanz-Reihenfolge erhalten,
    // Sortierung greift nur beim normalen Durchstöbern/Kategorie-Filtern.
    if (aiResults === null) {
      base = [...base].sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title, "de");
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
    return base;
  }, [aiResults, recipes, selectedCategories, lowCalorieOnly, sortBy]);

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

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === displayed.length ? new Set() : new Set(displayed.map((r) => r.id))
    );
  }

  const selectedRecipes = displayed.filter((r) => selectedIds.has(r.id));

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

      {/* Umschalter: normale Suche vs. Reste-Verwertung */}
      <div className="mt-4 flex gap-2 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card p-1">
        <button
          type="button"
          onClick={() => switchSearchMode("search")}
          className={`flex-1 rounded-[var(--radius-chip)] py-2 text-sm font-medium ${
            searchMode === "search" ? "bg-olive text-cream" : "text-ink-soft"
          }`}
        >
          Rezept-Suche
        </button>
        <button
          type="button"
          onClick={() => switchSearchMode("leftovers")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-chip)] py-2 text-sm font-medium ${
            searchMode === "leftovers" ? "bg-olive text-cream" : "text-ink-soft"
          }`}
        >
          <Recycle size={15} /> Reste verwerten
        </button>
      </div>

      {/* Kategorie-Filter: sofort, ohne Backend-Aufruf */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
          Nach Kategorie filtern
        </p>
        <div className="mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setLowCalorieOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-[var(--radius-chip)] border px-3.5 py-2 text-sm ${
              lowCalorieOnly ? "border-olive bg-olive text-cream" : "border-sand-line bg-cream-card text-ink"
            }`}
          >
            <Flame size={14} /> Unter {LOW_CALORIE_THRESHOLD} kcal
          </button>
        </div>
        <CategorySelector selected={selectedCategories} onChange={setSelectedCategories} />
      </div>

      {/* Textsuche in natürlicher Sprache bzw. Zutatenliste bei Reste-Verwertung */}
      <form
        onSubmit={handleSearch}
        className="mt-4 flex items-center gap-2.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-3"
      >
        {searchMode === "leftovers" ? (
          <Recycle size={18} strokeWidth={2} className="shrink-0 text-ink-soft" />
        ) : (
          <Search size={18} strokeWidth={2} className="shrink-0 text-ink-soft" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            searchMode === "leftovers"
              ? "z. B. Zucchini, Feta, Reis …"
              : "z. B. Irgendwas mit Hähnchen und Reis …"
          }
          className="w-full bg-transparent font-body text-sm text-ink placeholder:text-ink-soft focus:outline-none"
        />
        {(query || aiResults !== null) && (
          <button type="button" onClick={clearAiSearch} aria-label="Suche zurücksetzen" className="shrink-0 text-ink-soft">
            <X size={16} />
          </button>
        )}
      </form>

      <button
        type="button"
        onClick={handleSearch}
        disabled={isSearching || !query.trim()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-olive py-3 text-sm font-semibold text-cream disabled:opacity-60"
      >
        {isSearching ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Suche läuft …
          </>
        ) : searchMode === "leftovers" ? (
          "Rezepte dafür finden"
        ) : (
          "Mit KI durchsuchen"
        )}
      </button>

      {aiResults === null && !isSearching && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Beispiele
          </p>
          <div className="flex flex-wrap gap-2">
            {(searchMode === "leftovers" ? LEFTOVER_EXAMPLES : EXAMPLE_QUERIES).map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQuery(example)}
                className="rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-3 py-1.5 text-xs text-ink-soft"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {searchError && <p className="mt-4 text-sm text-red-700">{searchError}</p>}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {selectionMode
            ? `${selectedIds.size} ausgewählt`
            : isFiltering
              ? `${displayed.length} Treffer`
              : `${displayed.length} Rezept${displayed.length !== 1 ? "e" : ""}`}
        </p>
        {selectionMode && displayed.length > 0 ? (
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-xs font-medium text-olive underline"
          >
            {selectedIds.size === displayed.length ? "Keine auswählen" : "Alle auswählen"}
          </button>
        ) : (
          !isFiltering && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-3 py-1.5 text-xs text-ink"
            >
              <option value="newest">Neueste zuerst</option>
              <option value="title">Titel A–Z</option>
            </select>
          )
        )}
      </div>

      {displayed.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-soft">
          {isFiltering ? "Keine passenden Rezepte gefunden." : "Noch keine Rezepte im Kochbuch."}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
          {displayed.map((recipe) => (
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
