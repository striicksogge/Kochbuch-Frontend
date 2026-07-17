import { useState, useMemo } from "react";
import { Search, Loader2, ArrowLeft, Flame, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useRecipes } from "../context/RecipesContext";
import { searchRecipes } from "../data/searchApi";
import RecipeCard from "../components/RecipeCard";
import CategorySelector from "../components/CategorySelector";

const EXAMPLE_QUERIES = ["Irgendwas mit Hähnchen und Reis", "Pasta mit Spinat", "Schnell für heute"];
const LOW_CALORIE_THRESHOLD = 600;

/**
 * Suche + Kategorie-Filterung an einem Ort (ersetzt die frühere
 * separate Kategorien-Seite, um die Bottom-Nav nicht doppelt zu
 * belegen). Zwei unabhängige, kombinierbare Wege zu Ergebnissen:
 *  - Kategorie-Chips/Schnellfilter: sofort, rein lokal, ohne Backend
 *  - Textsuche in natürlicher Sprache: über Claude (Backend-Aufruf)
 * Sind beide aktiv, wird das KI-Suchergebnis zusätzlich nach den
 * gewählten Kategorien gefiltert.
 */
export default function SearchPage() {
  const { recipes } = useRecipes();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [aiResults, setAiResults] = useState(null); // null = keine KI-Suche ausgeführt

  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [initialCategory] : []
  );
  const [lowCalorieOnly, setLowCalorieOnly] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim() || recipes.length === 0) return;

    setIsSearching(true);
    setError("");
    try {
      const matchingIds = await searchRecipes(query, recipes);
      const ordered = matchingIds.map((id) => recipes.find((r) => r.id === id)).filter(Boolean);
      setAiResults(ordered);
    } catch (err) {
      console.error(err);
      setError("Suche fehlgeschlagen (Server nicht erreichbar oder überlastet). Bitte erneut versuchen.");
    } finally {
      setIsSearching(false);
    }
  }

  function clearAiSearch() {
    setQuery("");
    setAiResults(null);
    setError("");
  }

  const hasActiveFilters = selectedCategories.length > 0 || lowCalorieOnly;
  const showResults = aiResults !== null || hasActiveFilters;

  const displayedResults = useMemo(() => {
    let base = aiResults !== null ? aiResults : recipes;
    if (selectedCategories.length > 0) {
      base = base.filter((r) => selectedCategories.some((c) => (r.categories || []).includes(c)));
    }
    if (lowCalorieOnly) {
      base = base.filter(
        (r) => typeof r.caloriesPerServing === "number" && r.caloriesPerServing < LOW_CALORIE_THRESHOLD
      );
    }
    return base;
  }, [aiResults, recipes, selectedCategories, lowCalorieOnly]);

  return (
    <div className="px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Zurück zur Startseite"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-xl font-semibold text-ink">Suche</h1>
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

      {/* Textsuche in natürlicher Sprache */}
      <form onSubmit={handleSearch} className="mt-6 flex items-center gap-2.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-3">
        <Search size={18} strokeWidth={2} className="shrink-0 text-ink-soft" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="z. B. Irgendwas mit Hähnchen und Reis …"
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
        ) : (
          "Mit KI durchsuchen"
        )}
      </button>

      {!showResults && !isSearching && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Beispiele
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example) => (
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

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      {showResults && !isSearching && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-ink-soft">
            {displayedResults.length === 0
              ? "Keine passenden Rezepte gefunden."
              : `${displayedResults.length} Treffer`}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {displayedResults.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
