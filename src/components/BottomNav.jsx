import { useState } from "react";
import { House, LayoutGrid, Heart, CalendarDays, MoreHorizontal } from "lucide-react";
import { NavLink } from "react-router-dom";
import WeiteresMenu from "./WeiteresMenu";

const NAV_ITEMS = [
  { id: "home", label: "Start", icon: House, to: "/" },
  { id: "all", label: "Alle", icon: LayoutGrid, to: "/all-recipes", tourId: "nav-all" },
  { id: "plan", label: "Plan", icon: CalendarDays, to: "/meal-plan", tourId: "nav-plan" },
  { id: "favorites", label: "Favoriten", icon: Heart, to: "/favorites", tourId: "nav-favorites" },
];

/**
 * Fixierte Bottom-Navigation, mobile-first. "Suche" wurde entfernt, da
 * die Suchleiste schon ganz oben auf der Startseite erreichbar ist -
 * stattdessen "Alle" (verlinkt auf die vollständige Rezeptliste), damit
 * die Nav nicht zwei Wege zur Suche vorhält. "Plan" führt zur
 * zusammengelegten Essensplan+Einkaufsliste-Seite (siehe
 * pages/PlanAndListPage.jsx) - das hat den fünften Slot für "Weiteres"
 * freigemacht (Speed-Dial-Menü, siehe WeiteresMenu.jsx).
 */
export default function BottomNav() {
  const [weiteresOpen, setWeiteresOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-10 border-t border-sand-line bg-cream-card/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around">
          {NAV_ITEMS.map(({ id, label, icon: Icon, to, tourId }) => (
            <li key={id} className="flex-1" data-tour={tourId}>
              <NavLink
                to={to}
                end={to === "/"}
                onClick={() => setWeiteresOpen(false)}
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
          <li className="flex-1" data-tour="nav-weiteres">
            <button
              type="button"
              onClick={() => setWeiteresOpen((v) => !v)}
              className={`flex w-full flex-col items-center gap-1 py-2.5 text-xs whitespace-nowrap transition-colors ${
                weiteresOpen ? "text-olive" : "text-ink-soft"
              }`}
            >
              <MoreHorizontal size={22} strokeWidth={weiteresOpen ? 2.4 : 2} />
              Weiteres
            </button>
          </li>
        </ul>
      </nav>
      <WeiteresMenu isOpen={weiteresOpen} onClose={() => setWeiteresOpen(false)} />
    </>
  );
}
