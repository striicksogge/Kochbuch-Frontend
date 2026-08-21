import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecipes } from "../context/RecipesContext";
import RecipeCard from "../components/RecipeCard";

/**
 * Zeigt alle Rezepte mit isFavorite === true.
 */
export default function Favorites() {
  const { recipes } = useRecipes();
  const favorites = recipes.filter((r) => r.isFavorite);

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Favoriten</h1>

      {favorites.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Heart size={36} strokeWidth={1.5} className="mb-3 text-olive" />
          <p className="text-sm text-ink-soft">
            Noch keine Favoriten. Tippe auf das Herz bei einem Rezept, um es hier zu sammeln.
          </p>
          <Link to="/" className="mt-4 text-sm font-medium text-olive underline">
            Zur Startseite
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5">
          {favorites.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
