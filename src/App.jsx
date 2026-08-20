import { useState, useEffect } from "react";
import { Routes, Route, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { RecipesProvider, useRecipes } from "./context/RecipesContext";
import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { activateTesterModeFromParams } from "./data/testerMode";
import { hasSeenLatestWhatsNew } from "./data/whatsNew";
import { getPendingSurveyId } from "./data/surveys";
import SplashScreen from "./components/SplashScreen";
import Login from "./components/Login";
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
 *
 * Web-Share-Target (Android/Chrome, App muss installiert sein): TikTok
 * "Teilen" -> REZIPI landet als echter GET-Aufruf mit ?title=/?text=/
 * ?url=-Parametern auf der ECHTEN URL (vor dem #), siehe
 * public/manifest.webmanifest ("share_target"). Das ist NICHT dasselbe
 * wie die Hash-Route-Query-Params, die useSearchParams() hier normal
 * liefert - deshalb wird das einmalig direkt über window.location.search
 * ausgelesen und der gefundene Link an AddRecipe.jsx weitergereicht,
 * die den Import automatisch startet (keine manuelle Eingabe nötig).
 */
const SHARE_URL_PATTERN = /https?:\/\/\S+/;

function extractSharedUrl() {
  const params = new URLSearchParams(window.location.search);
  const url = params.get("url");
  if (url) return url;
  const text = params.get("text");
  const match = text?.match(SHARE_URL_PATTERN);
  return match ? match[0] : null;
}
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <Loader2 size={28} className="animate-spin text-olive" />
    </div>
  );
}

export default function App() {
  const { user, authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <RecipesProvider>
      <AppContent />
    </RecipesProvider>
  );
}

/**
 * Eigentlicher Inhalt, erst gerendert wenn ein Nutzer eingeloggt ist -
 * braucht useRecipes() (RecipesProvider muss also schon ein Vorfahre
 * sein) um auf `dataReady` zu warten: Migration + erster
 * Firestore-Schnappschuss müssen durch sein, bevor Seiten wie
 * MealPlanPage.jsx, die den Essensplan synchron in einem
 * useState-Initializer lesen, gerendert werden - sonst würden sie mit
 * veralteten Default-Werten starten und nie wieder aktualisieren.
 */
function AppContent() {
  const { dataReady } = useRecipes();
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
  const navigate = useNavigate();

  useEffect(() => {
    activateTesterModeFromParams(searchParams);
  }, [searchParams]);

  // Einmalig beim Start prüfen, ob die App über den Share-Target-
  // Mechanismus mit einem geteilten Link geöffnet wurde (siehe oben).
  useEffect(() => {
    const shared = extractSharedUrl();
    if (shared) {
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      navigate(`/add?sharedUrl=${encodeURIComponent(shared)}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tester-Umfragen (data/surveys.js) werden asynchron ausgelöst (nach
  // einem erfolgreichen Import in AddRecipe.jsx), deshalb bei jeder
  // Navigation neu prüfen, ob inzwischen eine ansteht.
  useEffect(() => {
    const pending = getPendingSurveyId();
    if (pending) setPendingSurveyId(pending);
  }, [location]);

  if (!dataReady) {
    return <LoadingScreen />;
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
    </ToastProvider>
  );
}
