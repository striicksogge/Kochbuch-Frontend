import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronDown, ChevronLeft, ChevronRight, ShoppingCart, CalendarDays, Dices, Search } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { WEEKDAYS, WEEK_COUNT, WEEK_LABELS, getMealPlan, saveMealPlan } from "../data/mealPlanStorage";
import { saveSelectedRecipeIds } from "../data/shoppingListStorage";

/**
 * Essensplan als wiederkehrende Wochenvorlage (kein festes Datum,
 * einfach "Montag -> Rezept X"). Tag antippen öffnet eine Liste zur
 * Auswahl (statt Drag & Drop, das auf Touchscreens unzuverlässig ist).
 * Würfel-Symbol pro Tag und "Woche zufällig füllen" für alle auf einmal.
 *
 * Mehrere Wochenvorlagen ("Diese Woche" / "Nächste Woche"), umschaltbar
 * über den Pfeil-Pager ganz oben - siehe data/mealPlanStorage.js
 * (weekOffset-Parameter).
 */
export default function MealPlanPage() {
  const { recipes } = useRecipes();
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [plan, setPlan] = useState(() => getMealPlan(weekOffset));
  const [openDay, setOpenDay] = useState(null);
  const [dayFilter, setDayFilter] = useState("");

  useEffect(() => {
    setPlan(getMealPlan(weekOffset));
    setOpenDay(null);
  }, [weekOffset]);

  function toggleDay(dayKey) {
    setOpenDay(openDay === dayKey ? null : dayKey);
    setDayFilter(""); // frisches Suchfeld bei jedem Öffnen
  }

  function assignRecipe(dayKey, recipeId) {
    const next = { ...plan, [dayKey]: recipeId };
    setPlan(next);
    saveMealPlan(next, weekOffset);
    setOpenDay(null);
  }

  function randomRecipeId() {
    return recipes[Math.floor(Math.random() * recipes.length)].id;
  }

  function assignRandomRecipe(dayKey) {
    assignRecipe(dayKey, randomRecipeId());
  }

  function fillWeekRandomly() {
    const next = { ...plan };
    WEEKDAYS.forEach((day) => {
      next[day.key] = randomRecipeId();
    });
    setPlan(next);
    saveMealPlan(next, weekOffset);
  }

  function clearDay(dayKey) {
    const next = { ...plan, [dayKey]: null };
    setPlan(next);
    saveMealPlan(next, weekOffset);
  }

  function getRecipe(id) {
    return recipes.find((r) => r.id === id) || null;
  }

  // Bewusst NICHT deduplizieren: ist dasselbe Rezept an zwei Tagen
  // eingeplant, soll es in der Einkaufsliste auch doppelt zählen
  // (siehe buildShoppingList in ShoppingListPage - summiert pro Vorkommen).
  const assignedIds = Object.values(plan).filter(Boolean);

  function handleCreateShoppingList() {
    saveSelectedRecipeIds(assignedIds);
    navigate("/shopping-list");
  }

  return (
    <div className="px-4 pb-24 pt-6 lg:pb-10">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w - 1)}
          disabled={weekOffset === 0}
          aria-label="Vorherige Woche"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="w-32 text-center font-display text-sm font-medium text-ink">
          {WEEK_LABELS[weekOffset]}
        </span>
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w + 1)}
          disabled={weekOffset === WEEK_COUNT - 1}
          aria-label="Nächste Woche"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Essensplan</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Wiederkehrende Wochenvorlage – lege für jeden Tag ein Rezept fest.
      </p>

      {recipes.length > 0 && (
        <button
          type="button"
          onClick={fillWeekRandomly}
          className="mt-4 flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-3.5 py-2 text-sm text-ink"
        >
          <Dices size={16} /> Ganze Woche zufällig füllen
        </button>
      )}

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
                  onClick={() => toggleDay(day.key)}
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
                          onError={(e) => { e.target.onerror = null; e.target.style.visibility = "hidden"; }}
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
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      assignRandomRecipe(day.key);
                    }}
                    aria-label={`Zufälliges Rezept für ${day.label}`}
                    title="Zufälliges Rezept"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-soft"
                  >
                    <Dices size={16} />
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-sand-line p-2">
                    {recipes.length > 5 && (
                      <div className="mb-2 flex items-center gap-2 rounded-lg border border-sand-line bg-cream px-2.5 py-1.5">
                        <Search size={14} className="shrink-0 text-ink-soft" />
                        <input
                          type="text"
                          value={dayFilter}
                          onChange={(e) => setDayFilter(e.target.value)}
                          placeholder="Rezept suchen …"
                          autoFocus
                          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
                        />
                      </div>
                    )}
                    <div className="max-h-56 overflow-y-auto">
                      {recipes
                        .filter((r) => r.title.toLowerCase().includes(dayFilter.trim().toLowerCase()))
                        .map((recipe) => (
                          <button
                            key={recipe.id}
                            type="button"
                            onClick={() => assignRecipe(day.key, recipe.id)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-ink hover:bg-cream"
                          >
                            {recipe.image ? (
                              <img
                                src={recipe.image}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded-lg object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.style.visibility = "hidden"; }}
                              />
                            ) : (
                              <span className="h-8 w-8 shrink-0 rounded-lg bg-sand-line" />
                            )}
                            {recipe.title}
                          </button>
                        ))}
                    </div>
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
