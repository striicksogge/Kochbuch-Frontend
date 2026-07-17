import { useNavigate, Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Hero from "../components/Hero";
import RecipeSlider from "../components/RecipeSlider";
import AddRecipeButton from "../components/AddRecipeButton";
import { useRecipes } from "../context/RecipesContext";
import { ChefHat, Dices } from "lucide-react";

/**
 * Startseite: Hero (zuletzt hinzugefügtes Rezept) + "Zuletzt hinzugefügt"
 * + bis zu 3 Kategorie-Bereiche, dynamisch anhand der tatsächlich
 * vorhandenen Rezepte ermittelt (keine leeren Kategorien anzeigen).
 */
export default function Home() {
  const { recipes } = useRecipes();
  const navigate = useNavigate();

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

  const heroRecipe = recipes[0];
  const favorites = recipes.filter((r) => r.isFavorite);

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

      <Hero recipe={heroRecipe} />

      <RecipeSlider title="Zuletzt hinzugefügt" icon="sparkles" recipes={recipes} />

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
