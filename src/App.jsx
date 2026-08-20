import { useState, useEffect } from "react";
import { Routes, Route, useSearchParams, useLocation } from "react-router-dom";
import { RecipesProvider } from "./context/RecipesContext";
import { ToastProvider } from "./context/ToastContext";
import { activateTesterModeFromParams } from "./data/testerMode";
import { hasSeenLatestWhatsNew } from "./data/whatsNew";
import { getPendingSurveyId } from "./data/surveys";
import SplashScreen from "./components/SplashScreen";
import Onboarding, { hasSeenOnboarding } from "./components/Onboarding";
import AppTour from "./components/AppTour";
import WhatsNewModal from "./components/WhatsNewModal";
import SurveyModal from "./components/SurveyModal";
import Home from "./pages/Home";
import RecipeDetail from "./pages/RecipeDetail";
import RecipeForm from "./pages/RecipeForm";
import AddRecipe from "./pages/AddRecipe";
import SearchPage from "./pages/SearchPage";
import Favorites from "./pages/Favorites";
import WantToCook from "./pages/WantToCook";
import PlanAndListPage from "./pages/PlanAndListPage";
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
 * und AddRecipe.jsx. Löst außerdem zwei kurze Umfragen aus (nach dem
 * ersten Import und nach Erreichen des Limits), siehe data/surveys.js.
 */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());
  const [tourActive, setTourActive] = useState(false);
  // Nur für bestehende Nutzer relevant - Erststarter sehen die aktuellen
  // Funktionen bereits im Onboarding (siehe Onboarding.jsx).
  const [showWhatsNew, setShowWhatsNew] = useState(
    () => hasSeenOnboarding() && !hasSeenLatestWhatsNew()
  );
  const [pendingSurveyId, setPendingSurveyId] = useState(() => getPendingSurveyId());
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    activateTesterModeFromParams(searchParams);
  }, [searchParams]);

  // Tester-Umfragen (data/surveys.js) werden asynchron ausgelöst (nach
  // einem erfolgreichen Import in AddRecipe.jsx), deshalb bei jeder
  // Navigation neu prüfen, ob inzwischen eine ansteht.
  useEffect(() => {
    const pending = getPendingSurveyId();
    if (pending) setPendingSurveyId(pending);
  }, [location]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return (
      <Onboarding
        onFinish={(withTour) => {
          setShowOnboarding(false);
          setTourActive(withTour);
        }}
      />
    );
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
            <Route path="/want-to-cook" element={<WantToCook />} />
            <Route path="/shopping-list" element={<PlanAndListPage />} />
            <Route path="/meal-plan" element={<PlanAndListPage />} />
            <Route path="/all-recipes" element={<AllRecipesPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
          </Routes>
          <BottomNav />
        </div>
        {tourActive && <AppTour onFinish={() => setTourActive(false)} />}
        {showWhatsNew && <WhatsNewModal onClose={() => setShowWhatsNew(false)} />}
        {!showWhatsNew && pendingSurveyId && (
          <SurveyModal surveyId={pendingSurveyId} onClose={() => setPendingSurveyId(null)} />
        )}
      </RecipesProvider>
    </ToastProvider>
  );
}
