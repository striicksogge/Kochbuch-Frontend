import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Hero from "../components/Hero";
import RecipeSlider from "../components/RecipeSlider";
import AddRecipeButton from "../components/AddRecipeButton";
import { useRecipes } from "../context/RecipesContext";
import { ChefHat, Dices, CalendarCheck, History } from "lucide-react";
import { WEEKDAYS, getMealPlan } from "../data/mealPlanStorage";

// JS Date.getDay(): 0=Sonntag, 1=Montag, ... 6=Samstag -> auf unsere Wochentag-Keys mappen
const JS_DAY_TO_KEY = ["so", "mo", "di", "mi", "do", "fr", "sa"];

/**
 * Startseite. Aufbau (von oben nach unten):
 *  1. Suche
 *  2. "Was koche ich heute?"-Zufallsbutton
 *  3. Hero = zufälliges Rezept ("Rezept des Tages", wechselt bei jedem Aufruf)
 *  4. "Zuletzt hinzugefügt"
 *  5. "Heute laut Plan" - falls im Essensplan für den heutigen Wochentag
 *     ein Rezept eingetragen ist
 *  6. "Lange nicht gekocht" - Rezepte mit dem ältesten lastCookedAt,
 *     die aber schon mindestens einmal gekocht wurden (sonst wäre es
 *     einfach "noch nie gekocht", eine andere Aussage)
 *  7. Favoriten + Kategorie-Bereiche (dynamisch, wie zuvor)
 */
export default function Home() {
  const { recipes } = useRecipes();
  const navigate = useNavigate();

  // Zufälliges Rezept fürs Hero - pro Seitenaufruf neu gewürfelt (useMemo
  // ohne Abhängigkeit von recipes.length würde bei jedem Re-Render neu
  // würfeln; wir wollen "einmal pro Aufruf", daher an recipes gebunden,
  // aber nicht an Zeit - das ist ein bewusster Kompromiss, kein Bug).
  const heroRecipe = useMemo(() => {
    if (recipes.length === 0) return null;
    return recipes[Math.floor(Math.random() * recipes.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipes.length]);

  function suggestRandomRecipe() {
    const random = recipes[Math.floor(Math.random() * recipes.length)];
    navigate(`/recipe/${random.id}`);
  }

  if (recipes.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-8 pb-24 text-center">
        <ChefHat size={40} strokeWidth={1.5} className="mb-4 text-olive" />
        <h1 className="font-display text-xl font-semibold text-ink">
          Dein Kochbuch ist noch leer
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Leg dein erstes Rezept an – Titel, Zutaten, Zubereitung reichen zum Start.
        </p>
        <Link
          to="/add"
          className="mt-5 rounded-[var(--radius-chip)] bg-olive px-6 py-3 text-sm font-semibold text-cream"
        >
          Erstes Rezept hinzufügen
        </Link>
      </div>
    );
  }

  const favorites = recipes.filter((r) => r.isFavorite);

  // "Heute laut Plan"
  const todayKey = JS_DAY_TO_KEY[new Date().getDay()];
  const todayLabel = WEEKDAYS.find((d) => d.key === todayKey)?.label;
  const plan = getMealPlan();
  const todayRecipe = plan[todayKey] ? recipes.find((r) => r.id === plan[todayKey]) : null;

  // "Lange nicht gekocht": schon mindestens einmal gekocht, ältestes lastCookedAt zuerst
  const notCookedRecently = recipes
    .filter((r) => r.lastCookedAt)
    .sort((a, b) => new Date(a.lastCookedAt) - new Date(b.lastCookedAt))
    .slice(0, 6);

  // Häufigste Kategorien unter den vorhandenen Rezepten ermitteln
  // (mindestens 2 Rezepte, damit ein Slider sich überhaupt lohnt).
  const categoryCounts = {};
  recipes.forEach((r) => {
    (r.categories || []).forEach((c) => {
      categoryCounts[c] = (categoryCounts[c] || 0) + 1;
    });
  });
  const topCategories = Object.entries(categoryCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return (
    <div className="pb-24">
      <SearchBar />

      <div className="px-4 pt-3">
        <button
          type="button"
          onClick={suggestRandomRecipe}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] border border-olive bg-olive/10 py-2.5 text-sm font-medium text-olive-deep"
        >
          <Dices size={17} /> Was koche ich heute?
        </button>
      </div>

      {heroRecipe && <Hero recipe={heroRecipe} />}

      <RecipeSlider title="Zuletzt hinzugefügt" icon="sparkles" recipes={recipes} />

      {/* Heute laut Plan */}
      {todayRecipe && (
        <section className="mt-8 px-4">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-medium text-ink">
            <CalendarCheck size={18} strokeWidth={2} className="text-olive" />
            Heute laut Plan ({todayLabel})
          </h2>
          <Link
            to={`/recipe/${todayRecipe.id}`}
            className="flex items-center gap-3 rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-3"
          >
            {todayRecipe.image ? (
              <img
                src={todayRecipe.image}
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <span className="h-14 w-14 shrink-0 rounded-xl bg-sand-line" />
            )}
            <span className="font-display text-base font-medium text-ink">{todayRecipe.title}</span>
          </Link>
        </section>
      )}

      {notCookedRecently.length > 0 && (
        <RecipeSlider title="Lange nicht gekocht" icon="history" recipes={notCookedRecently} />
      )}

      {favorites.length > 0 && (
        <RecipeSlider title="Favoriten" icon="heart" recipes={favorites} linkTo="/favorites" />
      )}

      {topCategories.map((categoryName) => (
        <RecipeSlider
          key={categoryName}
          title={categoryName}
          icon="utensils"
          recipes={recipes.filter((r) => (r.categories || []).includes(categoryName))}
          linkTo={`/search?category=${encodeURIComponent(categoryName)}`}
        />
      ))}

      <AddRecipeButton />
    </div>
  );
}
