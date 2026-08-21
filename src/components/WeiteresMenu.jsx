import { useState } from "react";
import WeiteresPanels from "./WeiteresPanels";
import { WEITERES_ITEMS } from "../data/weiteresItems";

/**
 * "Weiteres"-Menüpunkt der mobilen Bottom-Nav: kein eigener Screen,
 * sondern ein Speed-Dial (schwebende Buttons oberhalb der Nav). Die
 * sechs Punkte kommen aus data/weiteresItems.js (geteilt mit der
 * Desktop-Seitenleiste, siehe Sidebar.jsx), die Panel-Inhalte selbst aus
 * WeiteresPanels.jsx - bewusst so aufgeteilt, damit Desktop und Mobile
 * dieselben Panels ohne Duplikation öffnen, nur der Trigger
 * unterscheidet sich (Speed-Dial hier vs. Untermenü in der Sidebar).
 */
export default function WeiteresMenu({ isOpen, onClose }) {
  const [activePanel, setActivePanel] = useState(null);

  function openPanel(id) {
    setActivePanel(id);
    onClose();
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={onClose}>
          <div
            className="absolute bottom-20 right-4 flex flex-col items-end gap-2.5"
            style={{ marginBottom: "env(safe-area-inset-bottom)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {WEITERES_ITEMS.map(({ id, icon, label }) => (
              <SpeedDialItem key={id} icon={icon} label={label} onClick={() => openPanel(id)} />
            ))}
          </div>
        </div>
      )}

      <WeiteresPanels activePanel={activePanel} onClose={() => setActivePanel(null)} />
    </>
  );
}

function SpeedDialItem({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-sand-line bg-cream-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg"
    >
      {label}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
        <Icon size={16} />
      </span>
    </button>
  );
}
