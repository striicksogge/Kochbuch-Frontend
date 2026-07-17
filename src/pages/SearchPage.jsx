import { useState } from "react";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecipes } from "../context/RecipesContext";
import { searchRecipes } from "../data/searchApi";
import RecipeCard from "../components/RecipeCard";

const EXAMPLE_QUERIES = ["Irgendwas mit Hähnchen und Reis", "Pasta mit Spinat", "Schnell für heute"];

/**
 * Intelligente Suche in natürlicher Sprache. Schickt die vorhandenen
 * Rezepte (kompakt) + Sucheingabe ans Backend, Claude liefert die
 * passenden IDs zurück.
 */
export default function SearchPage() {
  const { recipes } = useRecipes();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null); // null = noch keine Suche ausgeführt

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim() || recipes.length === 0) return;

    setIsSearching(true);
    setError("");
    try {
      const matchingIds = await searchRecipes(query, recipes);
      const ordered = matchingIds
        .map((id) => recipes.find((r) => r.id === id))
        .filter(Boolean);
      setResults(ordered);
    } catch (err) {
      console.error(err);
      setError("Suche fehlgeschlagen (Server nicht erreichbar oder überlastet). Bitte erneut versuchen.");
    } finally {
      setIsSearching(false);
    }
  }

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

      <form onSubmit={handleSearch} className="mt-4 flex items-center gap-2.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-3">
        <Search size={18} strokeWidth={2} className="shrink-0 text-ink-soft" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="z. B. Irgendwas mit Hähnchen und Reis …"
          autoFocus
          className="w-full bg-transparent font-body text-sm text-ink placeholder:text-ink-soft focus:outline-none"
        />
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
          "Suchen"
        )}
      </button>

      {/* Beispiele nur anzeigen, solange noch nicht gesucht wurde */}
      {results === null && !isSearching && (
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

      {results !== null && !isSearching && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-ink-soft">
            {results.length === 0
              ? "Keine passenden Rezepte gefunden."
              : `${results.length} Treffer für "${query}"`}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {results.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
