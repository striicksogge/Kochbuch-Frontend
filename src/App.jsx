import { useState, useEffect } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import { RecipesProvider } from "./context/RecipesContext";
import { ToastProvider } from "./context/ToastContext";
import { activateTesterModeFromParams } from "./data/testerMode";
import SplashScreen from "./components/SplashScreen";
import Onboarding, { hasSeenOnboarding } from "./components/Onboarding";
import Home from "./pages/Home";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeForm from "./pages/RecipeForm";
import AddRecipe from "./pages/AddRecipe";
import SearchPage from "./pages/SearchPage";
import Favorites from "./pages/Favorites";
import ShoppingListPage from "./pages/ShoppingListPage";
import MealPlanPage from "./pages/MealPlanPage";
import AllRecipesPage from "./pages/AllRecipesPage";
import FeedbackPage from "./pages/FeedbackPage";
import BottomNav from "./components/BottomNav";

/**
 * App-Grundgerüst mit Routing.
 * ToastProvider ganz außen, damit Hinweise (z. B. "Rückgängig" nach
 * dem Löschen) auch nach einer Navigation sichtbar bleiben.
 *
 * Vor der eigentlichen App zwei Zwischenschritte: Splash-Screen (bei
 * JEDEM Start kurz sichtbar) und Onboarding (nur beim allerersten
 * Start, danach dauerhaft übersprungen).
 *
 * Testmodus: Ein Link mit ?tester=1 aktiviert dauerhaft (in diesem
 * Browser) ein Test-Limit von 10 Importen, siehe data/testerMode.js
 * und AddRecipe.jsx.
 */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());
  const [searchParams] = useSearchParams();

  useEffect(() => {
    activateTesterModeFromParams(searchParams);
  }, [searchParams]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return <Onboarding onFinish={() => setShowOnboarding(false)} />;
  }

  return (
    <ToastProvider>
      <RecipesProvider>
        <div className="min-h-screen bg-cream font-body text-ink">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/add" element={<AddRecipe />} />
            <Route path="/recipe/:id/edit" element={<RecipeForm />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
            <Route path="/meal-plan" element={<MealPlanPage />} />
            <Route path="/all-recipes" element={<AllRecipesPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Routes>
          <BottomNav />
        </div>
      </RecipesProvider>
    </ToastProvider>
  );
}
