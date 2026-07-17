import { Sparkles, Heart, UtensilsCrossed, Beef, Cake, ChevronRight } from "lucide-react";
import RecipeCard from "./RecipeCard";

const ICONS = {
  sparkles: Sparkles,
  heart: Heart,
  utensils: UtensilsCrossed,
  beef: Beef,
  cake: Cake,
};

/**
 * Ein horizontal scrollbarer Rezeptbereich mit Überschrift.
 * Phase 1: reine Darstellung der übergebenen Rezepte, kein eigener State.
 */
export default function RecipeSlider({ title, icon, recipes }) {
  const Icon = ICONS[icon];

  if (!recipes || recipes.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-medium text-ink">
          {Icon && <Icon size={18} strokeWidth={2} className="text-olive" />}
          {title}
        </h2>
        <button
          type="button"
          className="flex items-center text-sm text-ink-soft transition-colors hover:text-olive"
          aria-label={`Alle Rezepte in ${title} ansehen`}
        >
          Alle
          <ChevronRight size={16} strokeWidth={2} />
        </button>
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
