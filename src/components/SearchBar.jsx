import { Search } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Prominente Suchleiste auf der Startseite. Führt zur eigentlichen
 * Suchseite (/search) mit der echten Eingabe – hier nur der Einstieg.
 */
export default function SearchBar() {
  return (
    <div className="px-4 pt-4">
      <Link
        to="/search"
        className="flex items-center gap-2.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-3 shadow-[0_2px_8px_-4px_rgba(43,42,34,0.15)]"
      >
        <Search size={18} strokeWidth={2} className="shrink-0 text-ink-soft" />
        <span className="text-sm text-ink-soft">Rezept, Zutat oder Idee suchen …</span>
      </Link>
    </div>
  );
}
