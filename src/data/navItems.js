import { House, LayoutGrid, Heart, CalendarDays } from "lucide-react";

/**
 * Gemeinsame Hauptnavigationspunkte, geteilt zwischen mobiler Bottom-Nav
 * (components/BottomNav.jsx) und Desktop-Seitenleiste
 * (components/Sidebar.jsx), damit beide immer synchron bleiben.
 */
export const NAV_ITEMS = [
  { id: "home", label: "Start", icon: House, to: "/" },
  { id: "all", label: "Alle", icon: LayoutGrid, to: "/all-recipes", tourId: "nav-all" },
  { id: "plan", label: "Plan", icon: CalendarDays, to: "/meal-plan", tourId: "nav-plan" },
  { id: "favorites", label: "Favoriten", icon: Heart, to: "/favorites", tourId: "nav-favorites" },
];
