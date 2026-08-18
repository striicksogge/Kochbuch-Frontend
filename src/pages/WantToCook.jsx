import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecipes } from "../context/RecipesContext";
import RecipeCard from "../components/RecipeCard";

/**
 * Zeigt alle Rezepte mit wantToCook === true - eine von den Favoriten
 * unabhängige Merkliste für "das möchte ich noch kochen" (im Gegensatz
 * zu Favoriten, das eher "das ist schon bewährt/beliebt" bedeutet).
 */
export default function WantToCook() {
  const { recipes } = useRecipes();
  const wantToCook = recipes.filter((r) => r.wantToCook);

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Will ich noch kochen</h1>
        <Link to="/favorites" className="text-xs font-medium text-olive underline">
          Favoriten
        </Link>
      </div>

      {wantToCook.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Bookmark size={36} strokeWidth={1.5} className="mb-3 text-olive" />
          <p className="text-sm text-ink-soft">
            Noch nichts gemerkt. Tippe auf das Lesezeichen bei einem Rezept, um es hier zu
            sammeln.
          </p>
          <Link to="/" className="mt-4 text-sm font-medium text-olive underline">
            Zur Startseite
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5">
          {wantToCook.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
