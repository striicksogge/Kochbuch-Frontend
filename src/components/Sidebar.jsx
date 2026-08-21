import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, ChevronDown, MoreHorizontal } from "lucide-react";
import { NAV_ITEMS } from "../data/navItems";
import { WEITERES_ITEMS } from "../data/weiteresItems";
import { isSidebarCollapsed, setSidebarCollapsed } from "../data/sidebarState";
import WeiteresPanels from "./WeiteresPanels";

/**
 * Linke Seitenleiste ab Desktop-Breite (Tailwind "lg", 1024px) statt der
 * mobilen Bottom-Nav (siehe BottomNav.jsx, dort "lg:hidden"). Beide
 * Komponenten liegen gleichzeitig im DOM, welche sichtbar ist entscheidet
 * reines CSS je Breakpoint - kein JS-Resize-Listener nötig.
 *
 * Ein-/ausfahrbar, Standard ausgefahren, Zustand wird pro Gerät gemerkt
 * (data/sidebarState.js, analog zu data/theme.js).
 *
 * "Weiteres" ist hier - anders als mobil - kein Speed-Dial-Popup,
 * sondern ein direkt in der Leiste ausklappbares Untermenü. Öffnet
 * dieselben Panels wie mobil (WeiteresPanels.jsx), nur der Trigger
 * unterscheidet sich.
 */
export default function Sidebar() {
  const [collapsed, setCollapsedState] = useState(isSidebarCollapsed);
  const [weiteresExpanded, setWeiteresExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  function updateCollapsed(next) {
    setCollapsedState(next);
    setSidebarCollapsed(next);
  }

  function handleWeiteresClick() {
    if (collapsed) {
      // Eingeklappt gibt es keinen Platz für ein Untermenü - erst ausfahren.
      updateCollapsed(false);
      setWeiteresExpanded(true);
    } else {
      setWeiteresExpanded((v) => !v);
    }
  }

  return (
    <>
      <aside
        className={`hidden shrink-0 flex-col border-r border-sand-line bg-cream-card transition-[width] duration-200 lg:sticky lg:top-0 lg:flex lg:h-screen ${
          collapsed ? "lg:w-[76px]" : "lg:w-64"
        }`}
      >
        <div className={`flex items-center pt-5 pb-4 ${collapsed ? "justify-center px-0" : "gap-2 px-4"}`}>
          {!collapsed && (
            <span className="font-display text-lg font-semibold text-olive-deep">REZIPI</span>
          )}
          <button
            type="button"
            onClick={() => updateCollapsed(!collapsed)}
            aria-label={collapsed ? "Seitenleiste ausfahren" : "Seitenleiste einklappen"}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 ${
              collapsed ? "" : "ml-auto"
            }`}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
          {NAV_ITEMS.map(({ id, label, icon: Icon, to, tourId }) => (
            <NavLink
              key={id}
              to={to}
              end={to === "/"}
              data-tour={tourId}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[var(--radius-chip)] px-3 py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${isActive ? "bg-olive/10 text-olive" : "text-ink-soft hover:bg-ink/5"}`
              }
            >
              <Icon size={20} strokeWidth={2} className="shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}

          <div>
            <button
              type="button"
              onClick={handleWeiteresClick}
              data-tour="nav-weiteres"
              title={collapsed ? "Weiteres" : undefined}
              className={`flex w-full items-center gap-3 rounded-[var(--radius-chip)] px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <MoreHorizontal size={20} strokeWidth={2} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">Weiteres</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform ${weiteresExpanded ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>
            {!collapsed && weiteresExpanded && (
              <div className="mt-1 flex flex-col gap-0.5 pl-3">
                {WEITERES_ITEMS.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActivePanel(id)}
                    className="flex items-center gap-2.5 rounded-[var(--radius-chip)] px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
                  >
                    <Icon size={16} className="shrink-0 text-honey" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>

      <WeiteresPanels activePanel={activePanel} onClose={() => setActivePanel(null)} />
    </>
  );
}
