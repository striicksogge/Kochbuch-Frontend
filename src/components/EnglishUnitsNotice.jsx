import { useState } from "react";
import { Info } from "lucide-react";

const STORAGE_KEY = "kochbuch_v2_hide_english_units_notice";

export function isEnglishUnitsNoticeHidden() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

/**
 * Popup-Hinweis, wenn ein frisch importiertes Rezept noch englische
 * Einheiten (cup, tbsp, tsp, oz, ...) enthält. Erscheint einmalig beim
 * Öffnen des Review-Formulars nach dem Import, nicht dauerhaft wie das
 * Thumbnail-Banner in ImageDisclaimerBanner.
 */
export default function EnglishUnitsNotice({ onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  function handleClose() {
    if (dontShowAgain) localStorage.setItem(STORAGE_KEY, "true");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-24 sm:items-center sm:pb-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-cream-card p-4 shadow-lg">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-honey/15 text-honey">
            <Info size={16} />
          </span>
          <div>
            <p className="font-display text-base font-medium text-ink">
              Englische Mengenangaben erkannt
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              Dank unserer Datenbank ist ein Umrechnen der gängigsten Zutaten in Gramm
              möglich, wir empfehlen aber, die Mengen trotzdem nochmal zu überprüfen.
            </p>
          </div>
        </div>

        <label className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          Diesen Hinweis nicht erneut anzeigen
        </label>

        <button
          type="button"
          onClick={handleClose}
          className="mt-3 w-full rounded-[var(--radius-chip)] bg-olive py-2.5 text-sm font-semibold text-cream"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
