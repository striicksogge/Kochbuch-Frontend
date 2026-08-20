import { Link, useLocation } from "react-router-dom";
import MealPlanPage from "./MealPlanPage";
import ShoppingListPage from "./ShoppingListPage";

/**
 * Gemeinsamer Einstieg für Essensplan und Einkaufsliste unter einem
 * Bottom-Nav-Slot (macht Platz für "Weiteres", siehe BottomNav.jsx).
 * Beide alten Routen (/meal-plan, /shopping-list) zeigen weiterhin auf
 * eigene URLs - der aktive Reiter ergibt sich aus dem Pfad, damit
 * bestehende interne Links (z. B. "Wochen-Einkaufsliste erstellen" in
 * MealPlanPage, das per navigate("/shopping-list") wechselt) unverändert
 * funktionieren. Die beiden Unterseiten selbst sind bewusst unverändert
 * geblieben, um bereits getestetes Verhalten nicht zu riskieren.
 */
export default function PlanAndListPage() {
  const location = useLocation();
  const activeTab = location.pathname === "/shopping-list" ? "list" : "plan";

  return (
    <div>
      <div className="flex justify-center gap-2 px-4 pt-4">
        <TabLink to="/meal-plan" label="Plan" isActive={activeTab === "plan"} />
        <TabLink to="/shopping-list" label="Liste" isActive={activeTab === "list"} />
      </div>
      {activeTab === "plan" ? <MealPlanPage /> : <ShoppingListPage />}
    </div>
  );
}

function TabLink({ to, label, isActive }) {
  return (
    <Link
      to={to}
      className={`rounded-[var(--radius-chip)] px-5 py-2 text-sm font-medium transition-colors ${
        isActive ? "bg-olive text-cream" : "border border-sand-line bg-cream-card text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
