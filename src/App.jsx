import { Routes, Route } from "react-router-dom";
import { RecipesProvider } from "./context/RecipesContext";
import Home from "./pages/Home";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeForm from "./pages/RecipeForm";
import AddRecipe from "./pages/AddRecipe";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import SearchPage from "./pages/SearchPage";
import Favorites from "./pages/Favorites";
import ShoppingListPage from "./pages/ShoppingListPage";
import MealPlanPage from "./pages/MealPlanPage";
import LowCaloriePage from "./pages/LowCaloriePage";
import BottomNav from "./components/BottomNav";

/**
 * App-Grundgerüst mit Routing.
 * Phase 9: Kochzeit-Erkennung + Kalorienschätzung laufen über die
 * Extraktion, dazu ein einfacher URL-Duplikat-Check beim Import.
 */
export default function App() {
  return (
    <RecipesProvider>
      <div className="min-h-screen bg-cream font-body text-ink">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/add" element={<AddRecipe />} />
          <Route path="/recipe/:id/edit" element={<RecipeForm />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:name" element={<CategoryDetail />} />
          <Route path="/low-calorie" element={<LowCaloriePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
          <Route path="/meal-plan" element={<MealPlanPage />} />
        </Routes>
        <BottomNav />
      </div>
    </RecipesProvider>
  );
}
