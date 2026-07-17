import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, Users, Pencil, Trash2, ArrowLeft, ExternalLink, Heart, Minus, Plus, Flame, ChefHat, Check } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { useToast } from "../context/ToastContext";
import { scaleAmount } from "../data/ingredients";

/** Formatiert ein ISO-Datum als "heute", "gestern" oder "vor X Tagen". */
function formatRelativeDate(isoString) {
  const date = new Date(isoString);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "heute";
  if (diffDays === 1) return "gestern";
  if (diffDays < 30) return `vor ${diffDays} Tagen`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `vor ${months} Monat${months > 1 ? "en" : ""}`;
  return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

/**
 * Zeigt ein einzelnes Rezept vollständig an.
 */
export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, removeRecipe, restoreRecipe, toggleFavorite, markAsCooked } = useRecipes();
  const { showToast } = useToast();

  const recipe = recipes.find((r) => r.id === id);
  const [currentServings, setCurrentServings] = useState(recipe?.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());

  useEffect(() => {
    setCurrentServings(recipe?.servings || 4);
    setCheckedIngredients(new Set()); // frischer Start beim Wechsel zu einem anderen Rezept
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleIngredientChecked(index) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  if (!recipe) {
    return (
      <div className="px-4 pt-6 pb-24 text-center">
        <p className="font-display text-lg text-ink">Rezept nicht gefunden.</p>
        <p className="mt-1 text-sm text-ink-soft">
          Vielleicht wurde es gelöscht oder der Link ist nicht mehr gültig.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-[var(--radius-chip)] bg-olive px-5 py-2 text-sm font-semibold text-cream"
        >
          Zurück zur Startseite
        </Link>
      </div>
    );
  }

  function handleDelete() {
    const confirmed = window.confirm(`"${recipe.title}" löschen?`);
    if (!confirmed) return;

    const deletedRecipe = recipe; // Referenz sichern, bevor sie aus dem State verschwindet
    removeRecipe(recipe.id);
    navigate("/");
    showToast({
      message: `"${deletedRecipe.title}" gelöscht`,
      actionLabel: "Rückgängig",
      onAction: () => restoreRecipe(deletedRecipe),
    });
  }

  return (
    <div className="pb-28">
      {/* Bild + Zurück-Button */}
      <div className="relative">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-72 w-full object-cover sm:h-80"
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-cream-card text-ink-soft">
            Kein Bild hinterlegt
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Zurück"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-ink shadow-md backdrop-blur"
        >
          <ArrowLeft size={20} />
        </button>

        <button
          type="button"
          onClick={() => toggleFavorite(recipe.id)}
          aria-label={recipe.isFavorite ? "Von Favoriten entfernen" : "Zu Favoriten hinzufügen"}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 shadow-md backdrop-blur"
        >
          <Heart
            size={20}
            strokeWidth={2}
            className={recipe.isFavorite ? "fill-honey text-honey" : "text-ink"}
          />
        </button>
      </div>

      <div className="px-4 pt-5">
        <h1 className="font-display text-2xl font-semibold text-ink">{recipe.title}</h1>

        {recipe.description && (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{recipe.description}</p>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-ink-soft">
          {recipe.cookTime && (
            <span className="flex items-center gap-1.5">
              <Clock size={16} /> {recipe.cookTime}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users size={16} /> {recipe.servings} Portionen (Original)
          </span>
          {recipe.caloriesPerServing && (
            <span className="flex items-center gap-1.5" title="Grobe KI-Schätzung, keine exakte Nährwertangabe">
              <Flame size={16} /> ~{recipe.caloriesPerServing} kcal/Portion (geschätzt)
            </span>
          )}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-olive"
            >
              <ExternalLink size={16} /> Original ({recipe.platform || "Link"})
            </a>
          )}
        </div>

        {/* "Bereits gekocht"-Tracking */}
        <div className="mt-3 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              markAsCooked(recipe.id);
              showToast({ message: `"${recipe.title}" als heute gekocht markiert` });
            }}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-olive bg-olive/10 px-3.5 py-1.5 text-sm font-medium text-olive-deep"
          >
            <ChefHat size={15} /> Heute gekocht
          </button>
          {recipe.lastCookedAt && (
            <span className="text-xs text-ink-soft">
              Zuletzt gekocht: {formatRelativeDate(recipe.lastCookedAt)}
            </span>
          )}
        </div>

        {/* Portionen-Stepper: skaliert die Zutatenmengen live, ohne das
            gespeicherte Rezept zu verändern. */}
        <div className="mt-4 flex items-center gap-3 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2.5 w-fit">
          <span className="text-sm text-ink-soft">Portionen für die Anzeige:</span>
          <button
            type="button"
            onClick={() => setCurrentServings((s) => Math.max(1, s - 1))}
            aria-label="Weniger Portionen"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-sand-line text-ink"
          >
            <Minus size={14} />
          </button>
          <span className="w-5 text-center font-display text-base font-semibold text-ink">
            {currentServings}
          </span>
          <button
            type="button"
            onClick={() => setCurrentServings((s) => s + 1)}
            aria-label="Mehr Portionen"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-sand-line text-ink"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          <Link
            to={`/recipe/${recipe.id}/edit`}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2 text-sm font-medium text-ink"
          >
            <Pencil size={15} /> Bearbeiten
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2 text-sm font-medium text-red-700"
          >
            <Trash2 size={15} /> Löschen
          </button>
        </div>

        {/* Zutaten */}
        <section className="mt-8">
          <h2 className="font-display text-lg font-medium text-ink">Zutaten</h2>
          <p className="mt-1 text-xs text-ink-soft">Zum Abhaken beim Kochen antippen.</p>
          {recipe.ingredients.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {recipe.ingredients.map((ing, i) => {
                const isChecked = checkedIngredients.has(i);
                const label =
                  typeof ing === "string"
                    ? ing
                    : [scaleAmount(ing.amount, currentServings / (recipe.servings || 1)), ing.unit, ing.name]
                        .filter(Boolean)
                        .join(" ");
                return (
                  <li key={i} className="border-b border-sand-line pb-2">
                    <button
                      type="button"
                      onClick={() => toggleIngredientChecked(i)}
                      className="flex w-full items-start gap-2.5 text-left"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isChecked ? "border-olive bg-olive text-cream" : "border-sand-line"
                        }`}
                      >
                        {isChecked && <Check size={13} strokeWidth={3} />}
                      </span>
                      <span className={`text-sm ${isChecked ? "text-ink-soft line-through" : "text-ink"}`}>
                        {label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm italic text-ink-soft">Keine Zutaten hinterlegt.</p>
          )}
        </section>

        {/* Zubereitung */}
        <section className="mt-8">
          <h2 className="font-display text-lg font-medium text-ink">Zubereitung</h2>
          {recipe.steps.length > 0 ? (
            <ol className="mt-3 space-y-4">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-olive font-display text-xs font-semibold text-cream">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm italic text-ink-soft">Keine Zubereitungsschritte hinterlegt.</p>
          )}
        </section>

        {recipe.notes && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-medium text-ink">Notizen</h2>
            <p className="mt-3 whitespace-pre-wrap rounded-[var(--radius-card)] border border-honey/30 bg-honey/10 p-3 text-sm text-ink">
              {recipe.notes}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
