import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";

const STORAGE_KEY = "kochbuch_v2_hide_image_disclaimer";

/**
 * Zeigt eine kleine, klar als "nur Referenz" gekennzeichnete Vorschau
 * des importierten TikTok-Bilds (damit erkennbar bleibt, um welches
 * Rezept es geht), OHNE dass es wie ein bereits gesetztes Rezeptbild
 * aussieht (kein X-Entfernen-Button, kein großformatiges Bild wie beim
 * echten Bild-Feld). Der erklärende Text dazu ist dauerhaft ausblendbar,
 * die kleine Vorschau selbst bleibt unabhängig davon bestehen.
 */
export default function ImageDisclaimerBanner({ previewUrl }) {
  const [textHidden, setTextHidden] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [expanded, setExpanded] = useState(false);

  function handleDontShowAgain() {
    localStorage.setItem(STORAGE_KEY, "true");
    setTextHidden(true);
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-honey/40 bg-honey/10 p-3">
      <div className="flex items-start gap-2.5">
        {previewUrl && (
          <img
            src={previewUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg object-cover opacity-80"
            onError={(e) => (e.target.style.display = "none")}
          />
        )}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-honey">
            Nur Vorschau, noch nicht gespeichert
          </p>
          {!textHidden && (
            <p className="mt-0.5 text-sm text-ink">
              Das Thumbnail von TikTok kann nur temporär gespeichert werden. Bitte füge einen Screenshot hinzu.
            </p>
          )}
        </div>
      </div>

      {!textHidden && (
        <>
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
        </>
      )}
    </div>
  );
}
