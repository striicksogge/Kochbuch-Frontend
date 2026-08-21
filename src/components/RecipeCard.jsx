import { useState } from "react";
import { Clock, Heart, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useRecipes } from "../context/RecipesContext";
import { formatRelativeDate } from "../data/dateUtils";

/**
 * Einzelne Rezeptkarte für Slider und Grid-Ansichten.
 * Verlinkt auf die Detailseite, Herz-Button togglet Favorit direkt
 * auf der Karte (ohne zur Detailseite zu navigieren).
 *
 * imageFailed fängt tote Bild-Links ab (z. B. TikTok-Vorschaubilder,
 * deren URL nach einiger Zeit abläuft) - ohne das würde der Browser
 * ein kaputtes Icon + den Titel als Fließtext zeigen und das
 * Karten-Layout sprengen.
 *
 * Auswahl-Modus (selectionMode, siehe AllRecipesPage.jsx): Klick auf die
 * Karte togglet die Auswahl statt zur Detailseite zu navigieren, ein
 * Häkchen-Kreis oben links zeigt den Status.
 */
export default function RecipeCard({ recipe, selectionMode = false, selected = false, onToggleSelect }) {
  const { toggleFavorite } = useRecipes();
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = recipe.image && !imageFailed;

  function handleFavoriteClick(e) {
    e.preventDefault(); // verhindert Navigation über den umschließenden Link
    e.stopPropagation();
    toggleFavorite(recipe.id);
  }

  function handleCardClick(e) {
    if (!selectionMode) return;
    e.preventDefault();
    onToggleSelect?.(recipe.id);
  }

  return (
    <Link to={`/recipe/${recipe.id}`} onClick={handleCardClick} className="block w-full">
      <div className="dog-ear relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] bg-cream-card shadow-[0_8px_20px_-8px_rgba(43,42,34,0.25)]">
        {showImage ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-ink-soft">
            Kein Bild
          </div>
        )}

        {selectionMode ? (
          <span
            className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 ${
              selected ? "border-olive bg-olive text-cream" : "border-cream bg-ink/30 backdrop-blur-sm"
            }`}
          >
            {selected && <Check size={15} strokeWidth={3} />}
          </span>
        ) : (
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
        )}
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
        {recipe.lastCookedAt && (
          <p className="mt-0.5 text-[10px] text-ink-soft/80">
            {recipe.cookCount || 1}× gekocht · zuletzt {formatRelativeDate(recipe.lastCookedAt)}
          </p>
        )}
      </div>
    </Link>
  );
}
