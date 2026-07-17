import { House, Search, Heart, ShoppingCart, CalendarDays } from "lucide-react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { id: "home", label: "Start", icon: House, to: "/" },
  { id: "search", label: "Suche", icon: Search, to: "/search" },
  { id: "plan", label: "Plan", icon: CalendarDays, to: "/meal-plan" },
  { id: "list", label: "Liste", icon: ShoppingCart, to: "/shopping-list" },
  { id: "favorites", label: "Favoriten", icon: Heart, to: "/favorites" },
];

/**
 * Fixierte Bottom-Navigation, mobile-first. "Kategorien" wurde entfernt
 * und in die Suchseite integriert (Kategorie-Filter dort), um die
 * Funktion nicht doppelt vorzuhalten. Wieder 5 statt 6 Einträge,
 * deshalb Schrift/Icons wieder etwas größer als im 6-Item-Zustand.
 */
export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-sand-line bg-cream-card/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV_ITEMS.map(({ id, label, icon: Icon, to }) => (
          <li key={id} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex w-full flex-col items-center gap-1 py-2.5 text-xs whitespace-nowrap transition-colors ${
                  isActive ? "text-olive" : "text-ink-soft"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
