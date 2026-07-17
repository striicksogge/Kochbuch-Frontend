import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Großer Hero-Bereich oben auf der Startseite ("Rezept des Tages" /
 * zuletzt hinzugefügtes Rezept, je nach Aufrufer).
 */
export default function Hero({ recipe }) {
  return (
    <section className="px-4 pt-4">
      <p className="mb-2 font-display text-sm font-medium uppercase tracking-wide text-olive">
        Rezept des Tages
      </p>

      <div className="relative overflow-hidden rounded-[var(--radius-card)] shadow-[0_16px_32px_-16px_rgba(43,42,34,0.35)]">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-72 w-full object-cover sm:h-80"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-cream-card text-ink-soft sm:h-80">
            Kein Bild hinterlegt
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
          <h1 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="mt-1.5 max-w-md text-sm text-cream/90">{recipe.description}</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Link
              to={`/recipe/${recipe.id}`}
              className="rounded-[var(--radius-chip)] bg-cream px-5 py-2 font-body text-sm font-semibold text-ink transition-transform active:scale-95"
            >
              Ansehen
            </Link>
            {recipe.cookTime && (
              <span className="flex items-center gap-1 text-sm text-cream/90">
                <Clock size={14} strokeWidth={2} />
                {recipe.cookTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
