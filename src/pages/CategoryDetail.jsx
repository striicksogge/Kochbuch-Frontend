import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import RecipeCard from "../components/RecipeCard";

/**
 * Zeigt alle Rezepte einer einzelnen Kategorie (z. B. "Pasta").
 * Sortierung: Neueste zuerst (Standard) oder Titel A–Z.
 */
export default function CategoryDetail() {
  const { name } = useParams();
  const { recipes } = useRecipes();
  const [sortBy, setSortBy] = useState("newest");

  const matching = recipes
    .filter((r) => (r.categories || []).includes(name))
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title, "de");
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Link
          to="/categories"
          aria-label="Zurück zu Kategorien"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-xl font-semibold text-ink">{name}</h1>
      </div>

      {matching.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-soft">
          Noch keine Rezepte in dieser Kategorie.
        </p>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-ink-soft">
              {matching.length} Rezept{matching.length !== 1 && "e"}
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

          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
            {matching.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
