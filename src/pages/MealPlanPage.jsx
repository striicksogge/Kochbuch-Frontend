import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronDown, ShoppingCart, CalendarDays } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { WEEKDAYS, getMealPlan, saveMealPlan } from "../data/mealPlanStorage";
import { saveSelectedRecipeIds } from "../data/shoppingListStorage";

/**
 * Essensplan als wiederkehrende Wochenvorlage (kein festes Datum,
 * einfach "Montag -> Rezept X"). Tag antippen öffnet eine Liste zur
 * Auswahl (statt Drag & Drop, das auf Touchscreens unzuverlässig ist).
 */
export default function MealPlanPage() {
  const { recipes } = useRecipes();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(getMealPlan);
  const [openDay, setOpenDay] = useState(null);

  function assignRecipe(dayKey, recipeId) {
    const next = { ...plan, [dayKey]: recipeId };
    setPlan(next);
    saveMealPlan(next);
    setOpenDay(null);
  }

  function clearDay(dayKey) {
    const next = { ...plan, [dayKey]: null };
    setPlan(next);
    saveMealPlan(next);
  }

  function getRecipe(id) {
    return recipes.find((r) => r.id === id) || null;
  }

  const assignedIds = [...new Set(Object.values(plan).filter(Boolean))];

  function handleCreateShoppingList() {
    saveSelectedRecipeIds(assignedIds);
    navigate("/shopping-list");
  }

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Essensplan</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Wiederkehrende Wochenvorlage – lege für jeden Tag ein Rezept fest.
      </p>

      {recipes.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-soft">
          Noch keine Rezepte im Kochbuch, die sich einplanen lassen.
        </p>
      ) : (
        <div className="mt-5 space-y-2">
          {WEEKDAYS.map((day) => {
            const assignedRecipe = getRecipe(plan[day.key]);
            const isOpen = openDay === day.key;
            return (
              <div key={day.key} className="rounded-[var(--radius-card)] border border-sand-line bg-cream-card">
                <button
                  type="button"
                  onClick={() => setOpenDay(isOpen ? null : day.key)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  <span className="w-24 shrink-0 text-sm font-medium text-ink">{day.label}</span>

                  {assignedRecipe ? (
                    <span className="flex flex-1 items-center gap-2 overflow-hidden">
                      {assignedRecipe.image ? (
                        <img
                          src={assignedRecipe.image}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="h-8 w-8 shrink-0 rounded-lg bg-sand-line" />
                      )}
                      <span className="truncate text-sm text-ink">{assignedRecipe.title}</span>
                    </span>
                  ) : (
                    <span className="flex-1 text-sm text-ink-soft">+ Rezept wählen</span>
                  )}

                  {assignedRecipe && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDay(day.key);
                      }}
                      aria-label={`${day.label} zurücksetzen`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-soft"
                    >
                      <X size={15} />
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="max-h-56 overflow-y-auto border-t border-sand-line p-2">
                    {recipes.map((recipe) => (
                      <button
                        key={recipe.id}
                        type="button"
                        onClick={() => assignRecipe(day.key, recipe.id)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-ink hover:bg-cream"
                      >
                        {recipe.image ? (
                          <img src={recipe.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <span className="h-8 w-8 shrink-0 rounded-lg bg-sand-line" />
                        )}
                        {recipe.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {assignedIds.length > 0 && (
        <button
          type="button"
          onClick={handleCreateShoppingList}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-olive py-3 text-sm font-semibold text-cream"
        >
          <ShoppingCart size={17} /> Wochen-Einkaufsliste erstellen
        </button>
      )}

      {assignedIds.length === 0 && recipes.length > 0 && (
        <div className="mt-10 flex flex-col items-center text-center">
          <CalendarDays size={32} strokeWidth={1.5} className="mb-2 text-olive" />
          <p className="text-sm text-ink-soft">
            Sobald du Tage befüllt hast, kannst du hier direkt die Wochen-Einkaufsliste erstellen.
          </p>
        </div>
      )}
    </div>
  );
}
