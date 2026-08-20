import { useLayoutEffect, useState } from "react";

/**
 * Reihenfolge der geführten Tour. Jeder Schritt sucht per
 * data-tour="<id>" nach dem echten UI-Element und hebt es hervor -
 * fehlt ein Ziel auf der aktuellen Seite (z. B. "search"/"add" im
 * leeren Startzustand ohne Rezepte), wird der Schritt übersprungen.
 */
const STEPS = [
  { id: "search", text: "Hier suchst du nach Rezept, Zutat oder Idee – auch ganze Sätze wie „Schnell für heute“ funktionieren." },
  { id: "add", text: "Über diesen Button importierst du ein Rezept per Link (TikTok, Instagram, Pinterest) oder legst es manuell an." },
  { id: "nav-all", text: "„Alle“ zeigt deine komplette Rezeptliste, sortier- und filterbar." },
  { id: "nav-plan", text: "Im Essensplan verplanst du deine Woche pro Wochentag – von dort auch direkt zur Einkaufsliste, die die Zutaten automatisch zusammenfasst." },
  { id: "nav-favorites", text: "Hier landen deine mit ♥ markierten Lieblingsrezepte." },
  { id: "nav-weiteres", text: "Unter „Weiteres“ findest du Import/Export, eigene Kategorien und kannst Fehler oder Ideen melden." },
];

export default function AppTour({ onFinish }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const step = STEPS[stepIndex];

  useLayoutEffect(() => {
    // Sucht ab stepIndex den ersten Schritt, dessen Ziel-Element tatsächlich
    // auf der Seite vorhanden ist (z. B. "search"/"add" fehlen im leeren
    // Startzustand ohne Rezepte). Läuft als geschlossene Schleife in einem
    // einzigen Effect-Durchlauf, damit React StrictModes doppeltes Aufrufen
    // von Effects im Dev-Modus nicht zu doppelten Sprüngen führt.
    let idx = stepIndex;
    let el = STEPS[idx] ? document.querySelector(`[data-tour="${STEPS[idx].id}"]`) : null;
    while (STEPS[idx] && !el) {
      idx++;
      el = STEPS[idx] ? document.querySelector(`[data-tour="${STEPS[idx].id}"]`) : null;
    }
    if (!STEPS[idx] || !el) {
      onFinish();
      return;
    }
    if (idx !== stepIndex) {
      setStepIndex(idx);
      return;
    }
    el.scrollIntoView({ block: "center" });
    const update = () => setRect(el.getBoundingClientRect());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  if (!step || !rect) return null;

  const pad = 8;
  const spotTop = rect.top - pad;
  const spotLeft = rect.left - pad;
  const spotWidth = rect.width + pad * 2;
  const spotHeight = rect.height + pad * 2;
  const isLast = stepIndex === STEPS.length - 1;
  const showBelow = spotTop < window.innerHeight / 2;
  const tooltipWidth = 280;
  const tooltipLeft = Math.min(Math.max(spotLeft, 16), window.innerWidth - tooltipWidth - 16);

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-ink/60" />
      <div
        className="absolute rounded-2xl ring-2 ring-honey"
        style={{
          top: spotTop,
          left: spotLeft,
          width: spotWidth,
          height: spotHeight,
          boxShadow: "0 0 0 4px rgba(250,246,238,0.9)",
        }}
      />
      <div
        className="absolute rounded-[var(--radius-card)] bg-cream-card p-4 shadow-lg"
        style={{
          width: tooltipWidth,
          left: tooltipLeft,
          top: showBelow ? spotTop + spotHeight + 12 : undefined,
          bottom: !showBelow ? window.innerHeight - spotTop + 12 : undefined,
        }}
      >
        <p className="text-sm leading-relaxed text-ink">{step.text}</p>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={onFinish} className="text-xs text-ink-soft underline">
            Tour beenden
          </button>
          <button
            type="button"
            onClick={() => (isLast ? onFinish() : setStepIndex((i) => i + 1))}
            className="rounded-[var(--radius-chip)] bg-olive px-4 py-2 text-xs font-semibold text-cream"
          >
            {isLast ? "Fertig" : "Weiter"}
          </button>
        </div>
      </div>
    </div>
  );
}
