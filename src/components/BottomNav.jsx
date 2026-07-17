import { House, Search, Heart, LayoutGrid, ShoppingCart, CalendarDays } from "lucide-react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { id: "home", label: "Start", icon: House, to: "/" },
  { id: "search", label: "Suche", icon: Search, to: "/search" },
  { id: "plan", label: "Plan", icon: CalendarDays, to: "/meal-plan" },
  { id: "list", label: "Liste", icon: ShoppingCart, to: "/shopping-list" },
  { id: "favorites", label: "Favoriten", icon: Heart, to: "/favorites" },
  { id: "categories", label: "Kategorien", icon: LayoutGrid, to: "/categories" },
];

/**
 * Fixierte Bottom-Navigation, mobile-first. Alle 6 Ziele sind
 * voll funktionsfähig. whitespace-nowrap + kleine Schrift verhindert
 * Zeilenumbruch bei längeren Labels wie "Kategorien" auf schmalen Screens.
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
                `flex w-full flex-col items-center gap-1 py-2.5 text-[10px] whitespace-nowrap transition-colors ${
                  isActive ? "text-olive" : "text-ink-soft"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
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
