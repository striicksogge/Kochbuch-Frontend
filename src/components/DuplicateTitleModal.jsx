import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CopyCheck } from "lucide-react";

/**
 * Warnung beim Speichern, wenn schon ein Rezept mit demselben Titel
 * existiert (siehe data/recipeStorage.js: findRecipeByTitle). Anders
 * als der Link-Dopplung-Check beim Import (gleicher Quell-Link) ist das
 * hier kein harter Stopp - der Nutzer kann bewusst trotzdem speichern
 * (z. B. bei zwei wirklich unterschiedlichen Rezepten mit zufällig
 * gleichem Namen).
 *
 * Bug (gemeldet 2026-09-05): Das "Speichern"-Formularfeld sitzt ganz
 * unten, das Modal erscheint u. a. auf dem Handy ebenfalls unten
 * (items-end) mit "Trotzdem speichern" ungefähr an derselben Stelle.
 * Der Finger liegt beim Antippen von "Speichern" noch auf dem
 * Bildschirm, wenn das Modal an exakt dieser Position aufklappt -
 * Touch-Browser lösen dadurch quasi einen zweiten Tap auf den neuen
 * Button an derselben Koordinate aus, das Modal wirkt, als würde es
 * sich von selbst sofort wieder schließen. Deshalb reagieren die
 * Buttons die ersten ~350ms nach dem Erscheinen bewusst nicht.
 */
export default function DuplicateTitleModal({ existingRecipe, onConfirm, onCancel }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(timer);
  }, []);

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
            onClick={() => ready && onConfirm()}
            className="w-full rounded-[var(--radius-chip)] bg-olive py-2.5 text-sm font-semibold text-cream disabled:opacity-70"
          >
            Trotzdem speichern
          </button>
          <button
            type="button"
            onClick={() => ready && onCancel()}
            className="w-full rounded-[var(--radius-chip)] border border-sand-line bg-cream-card py-2.5 text-sm font-medium text-ink disabled:opacity-70"
          >
            Titel ändern
          </button>
        </div>
      </div>
    </div>
  );
}
