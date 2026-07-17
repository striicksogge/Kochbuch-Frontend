import { Link } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import RecipeCard from "../components/RecipeCard";

const THRESHOLD = 600;

/**
 * Zeigt alle Rezepte mit geschätzten Kalorien unter 600 kcal/Portion.
 * Bewusst als eigene Seite statt als Kategorie-Tag, da es sich aus
 * einem Zahlenwert berechnet statt einer manuellen Zuordnung.
 */
export default function LowCaloriePage() {
  const { recipes } = useRecipes();
  const matching = recipes.filter(
    (r) => typeof r.caloriesPerServing === "number" && r.caloriesPerServing < THRESHOLD
  );

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
        <h1 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <Flame size={20} className="text-olive" /> Unter {THRESHOLD} kcal
        </h1>
      </div>
      <p className="mt-2 ml-12 text-xs text-ink-soft">
        Basierend auf groben KI-Schätzungen, keine exakten Nährwertangaben.
      </p>

      {matching.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-soft">
          Keine Rezepte mit hinterlegter Kalorienschätzung unter {THRESHOLD} kcal.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5">
          {matching.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
