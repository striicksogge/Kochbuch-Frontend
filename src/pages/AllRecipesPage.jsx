import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import RecipeCard from "../components/RecipeCard";

/**
 * Zeigt wirklich ALLE Rezepte im Grid (im Gegensatz zu Home, wo nur
 * Ausschnitte/Slider zu sehen sind). Erreichbar über "Alle" beim
 * "Zuletzt hinzugefügt"-Bereich auf der Startseite.
 */
export default function AllRecipesPage() {
  const { recipes } = useRecipes();
  const [sortBy, setSortBy] = useState("newest");

  const sorted = [...recipes].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title, "de");
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

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
        <h1 className="font-display text-xl font-semibold text-ink">Alle Rezepte</h1>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {recipes.length} Rezept{recipes.length !== 1 && "e"}
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
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
