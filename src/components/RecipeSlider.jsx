import { Sparkles, Heart, UtensilsCrossed, Beef, Cake, ChevronRight, History } from "lucide-react";
import { Link } from "react-router-dom";
import RecipeCard from "./RecipeCard";

const ICONS = {
  sparkles: Sparkles,
  heart: Heart,
  utensils: UtensilsCrossed,
  beef: Beef,
  cake: Cake,
  history: History,
};

/**
 * Ein horizontal scrollbarer Rezeptbereich mit Überschrift.
 * "Alle" verlinkt optional weiter (z. B. zur Suche mit vorausgewähltem
 * Kategorie-Filter) - ohne linkTo bleibt es ein reiner Deko-Text ohne Funktion.
 */
export default function RecipeSlider({ title, icon, recipes, linkTo }) {
  const Icon = ICONS[icon];

  if (!recipes || recipes.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-medium text-ink">
          {Icon && <Icon size={18} strokeWidth={2} className="text-olive" />}
          {title}
        </h2>
        {linkTo && (
          <Link
            to={linkTo}
            className="flex items-center text-sm text-ink-soft transition-colors hover:text-olive"
            aria-label={`Alle Rezepte in ${title} ansehen`}
          >
            Alle
            <ChevronRight size={16} strokeWidth={2} />
          </Link>
        )}
      </div>

      <div className="scroll-row flex gap-3 overflow-x-auto px-4 pb-2">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="w-40 shrink-0 sm:w-48">
            <RecipeCard recipe={recipe} />
          </div>
        ))}
      </div>
    </section>
  );
}
