import { Upload } from "lucide-react";

/**
 * Fragt beim Backup-Import, ob die vorhandenen Rezepte durch die Datei
 * ersetzt (überschreiben) oder um die importierten Rezepte ergänzt
 * werden sollen (hinzufügen). Essensplan/Einkaufsliste werden beim
 * Hinzufügen nicht angerührt, siehe data/backup.js.
 */
export default function ImportModeModal({ onChoose, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-24 sm:items-center sm:pb-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-cream-card p-4 shadow-lg">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
            <Upload size={16} />
          </span>
          <div>
            <p className="font-display text-base font-medium text-ink">Backup einspielen</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              Sollen die Rezepte aus der Datei die aktuell gespeicherten ersetzen, oder zu
              den vorhandenen Rezepten hinzugefügt werden?
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => onChoose("merge")}
            className="w-full rounded-[var(--radius-chip)] bg-olive py-2.5 text-sm font-semibold text-cream"
          >
            Hinzufügen (vorhandene Rezepte bleiben)
          </button>
          <button
            type="button"
            onClick={() => onChoose("overwrite")}
            className="w-full rounded-[var(--radius-chip)] border border-sand-line bg-cream-card py-2.5 text-sm font-medium text-ink"
          >
            Überschreiben (ersetzt alles)
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-sm text-ink-soft"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
