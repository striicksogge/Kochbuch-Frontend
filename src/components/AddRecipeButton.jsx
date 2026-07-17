import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Schwebender "+"-Button zum Anlegen eines neuen Rezepts.
 * Sitzt über der Bottom-Nav, folgt gängigem Muster bei Pinterest/Ähnlichen.
 */
export default function AddRecipeButton() {
  return (
    <Link
      to="/add"
      aria-label="Neues Rezept hinzufügen"
      className="fixed bottom-24 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-olive text-cream shadow-[0_10px_24px_-8px_rgba(58,64,40,0.55)] transition-transform active:scale-95"
    >
      <Plus size={26} strokeWidth={2.4} />
    </Link>
  );
}
