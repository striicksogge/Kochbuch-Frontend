import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";

const STORAGE_KEY = "kochbuch_v2_hide_image_disclaimer";

/**
 * Hinweis, dass ein importiertes TikTok-/Pinterest-Vorschaubild nur
 * temporär verfügbar ist (siehe Entscheidung: kein dauerhafter Bild-
 * Download aus rechtlichen Gründen). Einmal dauerhaft ausblendbar,
 * Zustand landet in localStorage.
 */
export default function ImageDisclaimerBanner() {
  const [hidden, setHidden] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [expanded, setExpanded] = useState(false);

  if (hidden) return null;

  function handleDontShowAgain() {
    localStorage.setItem(STORAGE_KEY, "true");
    setHidden(true);
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-honey/40 bg-honey/10 p-3">
      <div className="flex items-start gap-2">
        <Info size={16} className="mt-0.5 shrink-0 text-honey" />
        <p className="text-sm text-ink">
          Das Thumbnail von TikTok kann nur temporär gespeichert werden. Bitte füge einen Screenshot hinzu.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 flex items-center gap-1 text-xs text-ink-soft underline"
      >
        Warum ist das so?
        <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          Wir speichern das Bild nicht selbst, sondern zeigen es direkt von TikTok an. Das schont
          deine Rechte an fremden Inhalten, bedeutet aber auch: Wenn TikTok den Link irgendwann
          ändert, verschwindet das Bild. Mit einem eigenen Screenshot bleibt es dauerhaft erhalten.
        </p>
      )}

      <button
        type="button"
        onClick={handleDontShowAgain}
        className="mt-2 text-xs text-ink-soft underline"
      >
        Diesen Hinweis nicht erneut anzeigen
      </button>
    </div>
  );
}
