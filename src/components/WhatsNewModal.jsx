import { Sparkles } from "lucide-react";
import { WHATS_NEW, markWhatsNewSeen } from "../data/whatsNew";

/**
 * Popup für bestehende Nutzer, wenn sich seit ihrem letzten Besuch neue
 * Funktionen angesammelt haben (siehe data/whatsNew.js). Neue Nutzer
 * sehen das nicht, weil das Onboarding die aktuelle Version direkt als
 * gesehen markiert - sie bekommen die Funktionen schon dort vorgestellt.
 */
export default function WhatsNewModal({ onClose }) {
  function handleClose() {
    markWhatsNewSeen();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-24 sm:items-center sm:pb-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-cream-card p-4 shadow-lg">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
            <Sparkles size={16} />
          </span>
          <div>
            <p className="font-display text-base font-medium text-ink">Was ist neu?</p>
            <ul className="mt-1.5 space-y-1.5 text-sm leading-relaxed text-ink-soft">
              {WHATS_NEW.items.map((item, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-olive">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

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
