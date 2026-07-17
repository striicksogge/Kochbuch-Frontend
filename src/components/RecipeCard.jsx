import { Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecipes } from "../context/RecipesContext";

/**
 * Einzelne Rezeptkarte für Slider und Grid-Ansichten.
 * Verlinkt auf die Detailseite, Herz-Button togglet Favorit direkt
 * auf der Karte (ohne zur Detailseite zu navigieren).
 */
export default function RecipeCard({ recipe }) {
  const { toggleFavorite } = useRecipes();

  function handleFavoriteClick(e) {
    e.preventDefault(); // verhindert Navigation über den umschließenden Link
    e.stopPropagation();
    toggleFavorite(recipe.id);
  }

  return (
    <Link to={`/recipe/${recipe.id}`} className="block w-full">
      <div className="dog-ear relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] bg-cream-card shadow-[0_8px_20px_-8px_rgba(43,42,34,0.25)]">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-soft">
            Kein Bild
          </div>
        )}

        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={recipe.isFavorite ? "Von Favoriten entfernen" : "Zu Favoriten hinzufügen"}
          className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/40 backdrop-blur-sm"
        >
          <Heart
            size={16}
            strokeWidth={2}
            className={recipe.isFavorite ? "fill-honey text-honey" : "text-cream"}
          />
        </button>
      </div>
      <div className="mt-2 px-1">
        <h3 className="truncate font-display text-[15px] font-medium text-ink">
          {recipe.title}
        </h3>
        {recipe.cookTime && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
            <Clock size={12} strokeWidth={2} />
            {recipe.cookTime}
          </p>
        )}
      </div>
    </Link>
  );
}
