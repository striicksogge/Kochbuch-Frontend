import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import RecipeFormFields from "../components/RecipeFormFields";

/**
 * Bearbeiten-Seite für ein bestehendes Rezept (Route: /recipe/:id/edit).
 * Das Anlegen neuer Rezepte läuft über AddRecipe.jsx (Link-Import ODER
 * manuell), das intern dieselben RecipeFormFields nutzt.
 */
export default function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, editRecipe } = useRecipes();

  const existingRecipe = recipes.find((r) => r.id === id);

  if (!existingRecipe) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-ink-soft">Rezept nicht gefunden.</p>
      </div>
    );
  }

  function handleSubmit(data) {
    editRecipe(id, data);
    navigate(`/recipe/${id}`);
  }

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Zurück"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-semibold text-ink">Rezept bearbeiten</h1>
      </div>

      <RecipeFormFields
        initialValues={existingRecipe}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="Änderungen speichern"
      />
    </div>
  );
}
