import { Link } from "react-router-dom";
import { CopyCheck } from "lucide-react";

/**
 * Warnung beim Speichern, wenn schon ein Rezept mit demselben Titel
 * existiert (siehe data/recipeStorage.js: findRecipeByTitle). Anders
 * als der Link-Dopplung-Check beim Import (gleicher Quell-Link) ist das
 * hier kein harter Stopp - der Nutzer kann bewusst trotzdem speichern
 * (z. B. bei zwei wirklich unterschiedlichen Rezepten mit zufällig
 * gleichem Namen).
 */
export default function DuplicateTitleModal({ existingRecipe, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-24 sm:items-center sm:pb-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-cream-card p-4 shadow-lg">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-honey/10 text-honey">
            <CopyCheck size={16} />
          </span>
          <div className="text-sm">
            <p className="text-ink">
              Es gibt bereits ein Rezept namens <strong>„{existingRecipe.title}"</strong>.
            </p>
            <Link
              to={`/recipe/${existingRecipe.id}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-olive underline"
            >
              Bestehendes Rezept ansehen
            </Link>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-[var(--radius-chip)] bg-olive py-2.5 text-sm font-semibold text-cream"
          >
            Trotzdem speichern
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-[var(--radius-chip)] border border-sand-line bg-cream-card py-2.5 text-sm font-medium text-ink"
          >
            Titel ändern
          </button>
        </div>
      </div>
    </div>
  );
}
