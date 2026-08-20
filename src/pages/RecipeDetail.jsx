import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, Users, Pencil, Trash2, ArrowLeft, ExternalLink, Heart, Bookmark, Copy, Minus, Plus, Flame, ChefHat, Check, CalendarPlus, ShoppingCart, Share2 } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { useToast } from "../context/ToastContext";
import { scaleAmount } from "../data/ingredients";
import { WEEKDAYS, getMealPlan, saveMealPlan } from "../data/mealPlanStorage";
import { getShoppingListState, saveSelectedRecipeIds } from "../data/shoppingListStorage";
import { formatRelativeDate } from "../data/dateUtils";

/**
 * Zeigt ein einzelnes Rezept vollständig an.
 */
export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, removeRecipe, restoreRecipe, toggleFavorite, markAsCooked, toggleWantToCook, duplicateRecipe } =
    useRecipes();
  const { showToast } = useToast();

  const recipe = recipes.find((r) => r.id === id);
  const [currentServings, setCurrentServings] = useState(recipe?.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [imageFailed, setImageFailed] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);

  useEffect(() => {
    setCurrentServings(recipe?.servings || 4);
    setCheckedIngredients(new Set()); // frischer Start beim Wechsel zu einem anderen Rezept
    setImageFailed(false);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleIngredientChecked(index) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  function handleAssignToDay(dayKey, dayLabel) {
    const plan = getMealPlan();
    plan[dayKey] = recipe.id;
    saveMealPlan(plan);
    setShowDayPicker(false);
    showToast({ message: `"${recipe.title}" für ${dayLabel} eingeplant` });
  }

  function handleAddToShoppingList() {
    const { selectedRecipeIds } = getShoppingListState();
    if (selectedRecipeIds.includes(recipe.id)) {
      showToast({ message: `"${recipe.title}" ist schon in der Einkaufsliste` });
      return;
    }
    saveSelectedRecipeIds([...selectedRecipeIds, recipe.id]);
    showToast({ message: `"${recipe.title}" zur Einkaufsliste hinzugefügt` });
  }

  // Teilt automatisch den Original-Link (TikTok/Pinterest/Instagram), nicht
  // einen Rezipi-internen Link - für importierte Rezepte ist das der Link,
  // den man eigentlich teilen will. Ohne sourceUrl (manuell angelegtes
  // Rezept) gibt es nichts Sinnvolles zu teilen, dann nur den Titel als Text.
  async function handleShare() {
    const shareData = recipe.sourceUrl
      ? { title: recipe.title, url: recipe.sourceUrl }
      : { title: recipe.title, text: recipe.title };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Nutzer hat den Teilen-Dialog abgebrochen - kein Fehler, kein Toast.
      }
      return;
    }
    // Kein Web-Share (z. B. Desktop-Browser): Link/Titel stattdessen kopieren.
    // Clipboard-Zugriff kann verweigert werden (Berechtigung/Sicherheitskontext),
    // dann wenigstens verständlich melden statt eines unbehandelten Fehlers.
    try {
      await navigator.clipboard.writeText(recipe.sourceUrl || recipe.title);
      showToast({ message: recipe.sourceUrl ? "Link kopiert" : "Titel kopiert" });
    } catch (err) {
      console.error(err);
      showToast({ message: "Teilen/Kopieren nicht möglich" });
    }
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

  async function handleDuplicate() {
    const copy = await duplicateRecipe(recipe.id);
    if (!copy) return;
    navigate(`/recipe/${copy.id}/edit`);
    showToast({ message: `"${recipe.title}" dupliziert` });
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
        {recipe.image && !imageFailed ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-72 w-full object-cover sm:h-80"
            onError={() => setImageFailed(true)}
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

        <div className="absolute right-4 top-4 flex gap-2">
          <button
            type="button"
            onClick={() => toggleWantToCook(recipe.id)}
            aria-label={recipe.wantToCook ? 'Von "Will ich noch kochen" entfernen' : 'Zu "Will ich noch kochen" hinzufügen'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 shadow-md backdrop-blur"
          >
            <Bookmark
              size={20}
              strokeWidth={2}
              className={recipe.wantToCook ? "fill-olive text-olive" : "text-ink"}
            />
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(recipe.id)}
            aria-label={recipe.isFavorite ? "Von Favoriten entfernen" : "Zu Favoriten hinzufügen"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 shadow-md backdrop-blur"
          >
            <Heart
              size={20}
              strokeWidth={2}
              className={recipe.isFavorite ? "fill-honey text-honey" : "text-ink"}
            />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5">
        <h1 className="font-display text-2xl font-semibold text-ink">{recipe.title}</h1>

        {recipe.description && (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{recipe.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-soft">
          {recipe.cookTime && (
            <span className="flex shrink-0 items-center gap-1.5">
              <Clock size={16} /> {recipe.cookTime}
            </span>
          )}
          <span className="flex shrink-0 items-center gap-1.5">
            <Users size={16} /> {recipe.servings} Portionen (Original)
          </span>
          {recipe.caloriesPerServing && (
            <span className="flex shrink-0 items-center gap-1.5" title="Grobe KI-Schätzung, keine exakte Nährwertangabe">
              <Flame size={16} /> ~{recipe.caloriesPerServing} kcal/Portion (geschätzt)
            </span>
          )}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 text-olive"
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

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to={`/recipe/${recipe.id}/edit`}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2 text-sm font-medium text-ink"
          >
            <Pencil size={15} /> Bearbeiten
          </Link>
          <button
            type="button"
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2 text-sm font-medium text-ink"
          >
            <Copy size={15} /> Duplizieren
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2 text-sm font-medium text-red-700"
          >
            <Trash2 size={15} /> Löschen
          </button>
          <button
            type="button"
            onClick={() => setShowDayPicker((v) => !v)}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2 text-sm font-medium text-ink"
          >
            <CalendarPlus size={15} /> Zum Essensplan
          </button>
          <button
            type="button"
            onClick={handleAddToShoppingList}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2 text-sm font-medium text-ink"
          >
            <ShoppingCart size={15} /> Zur Einkaufsliste
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2 text-sm font-medium text-ink"
          >
            <Share2 size={15} /> Teilen
          </button>
        </div>

        {showDayPicker && (
          <div className="mt-2 flex flex-wrap gap-1.5 rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-2.5">
            {WEEKDAYS.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => handleAssignToDay(day.key, day.label)}
                className="rounded-[var(--radius-chip)] border border-sand-line bg-cream px-3 py-1.5 text-xs text-ink"
              >
                {day.label}
              </button>
            ))}
          </div>
        )}

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
