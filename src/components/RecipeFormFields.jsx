import { useState, useRef } from "react";
import { Plus, X, Upload, Loader2 } from "lucide-react";
import CategorySelector from "./CategorySelector";
import { normalizeIngredients } from "../data/ingredients";
import { fileToCompressedDataUrl } from "../data/imageUtils";

/**
 * Reine Formular-Felder für ein Rezept, unabhängig davon, ob sie zum
 * Bearbeiten eines bestehenden oder zum Anlegen eines neuen (ggf. per
 * Link vorausgefüllten) Rezepts verwendet werden.
 *
 * Zutaten sind seit Phase 6 strukturiert (Menge/Einheit/Name getrennt),
 * damit die Einkaufsliste gleiche Zutaten zusammenfassen kann.
 */
export default function RecipeFormFields({ initialValues = {}, onSubmit, onCancel, submitLabel }) {
  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [image, setImage] = useState(initialValues.image || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);
  const [servings, setServings] = useState(initialValues.servings || 4);
  const [cookTime, setCookTime] = useState(initialValues.cookTime || "");
  const [caloriesPerServing, setCaloriesPerServing] = useState(initialValues.caloriesPerServing || "");
  const [notes, setNotes] = useState(initialValues.notes || "");
  const [ingredients, setIngredients] = useState(() => {
    const normalized = normalizeIngredients(initialValues.ingredients);
    // Immer mindestens eine leere Zeile zum Loslegen anbieten
    return normalized.length > 0 ? normalized : [{ id: "new_0", amount: "", unit: "", name: "" }];
  });
  const [stepsText, setStepsText] = useState((initialValues.steps || []).join("\n"));
  const [categories, setCategories] = useState(initialValues.categories || []);

  function updateIngredient(id, field, value) {
    setIngredients((prev) => prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)));
  }

  function addIngredientRow() {
    setIngredients((prev) => [...prev, { id: `new_${Date.now()}`, amount: "", unit: "", name: "" }]);
  }

  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setIsUploadingImage(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setImage(dataUrl);
    } catch (err) {
      setImageError(err.message || "Foto konnte nicht verarbeitet werden.");
    } finally {
      setIsUploadingImage(false);
      e.target.value = ""; // erlaubt erneute Auswahl derselben Datei
    }
  }

  function removeIngredientRow(id) {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  }

  function linesToArray(text) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cleanIngredients = ingredients
      .map((ing) => ({ ...ing, name: ing.name.trim() }))
      .filter((ing) => ing.name.length > 0);

    onSubmit({
      title,
      description,
      image,
      servings,
      cookTime,
      caloriesPerServing,
      ingredients: cleanIngredients,
      steps: linesToArray(stepsText),
      categories,
      notes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5 px-4">
      <Field label="Titel" required>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z. B. Cremige Garlic Butter Pasta"
          required
          className="form-input"
        />
      </Field>

      <Field label="Beschreibung">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Kurze Beschreibung, erscheint auf der Karte"
          className="form-input resize-none"
        />
      </Field>

      <Field label="Bild">
        <div className="flex gap-2">
          <input
            type="url"
            value={image.startsWith("data:") ? "" : image}
            onChange={(e) => setImage(e.target.value)}
            placeholder={image.startsWith("data:") ? "(eigenes Foto hochgeladen)" : "https://…"}
            className="form-input flex-1"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="flex shrink-0 items-center gap-1.5 rounded-[0.9rem] border border-sand-line bg-cream-card px-3 text-sm text-ink disabled:opacity-60"
          >
            {isUploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Foto
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>
        {imageError && <p className="mt-1.5 text-xs text-red-700">{imageError}</p>}
        {image && (
          <div className="relative mt-2">
            <img
              src={image}
              alt="Vorschau"
              className="h-32 w-full rounded-xl object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
            <button
              type="button"
              onClick={() => setImage("")}
              aria-label="Bild entfernen"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/60 text-cream"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </Field>

      <div className="flex gap-4">
        <Field label="Portionen" className="w-1/3">
          <input
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="Kochzeit" className="w-1/3">
          <input
            type="text"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            placeholder="z. B. 20 Min."
            className="form-input"
          />
        </Field>
        <Field label="kcal/Portion" className="w-1/3">
          <input
            type="number"
            min="0"
            value={caloriesPerServing}
            onChange={(e) => setCaloriesPerServing(e.target.value)}
            placeholder="~450"
            className="form-input"
          />
        </Field>
      </div>

      <Field label="Kategorien">
        <CategorySelector selected={categories} onChange={setCategories} />
      </Field>

      <Field label="Zutaten">
        <div className="space-y-2">
          {ingredients.map((ing) => (
            <div key={ing.id} className="flex gap-2">
              <input
                type="text"
                value={ing.amount}
                onChange={(e) => updateIngredient(ing.id, "amount", e.target.value)}
                placeholder="250"
                className="form-input w-16 text-center"
                aria-label="Menge"
              />
              <input
                type="text"
                value={ing.unit}
                onChange={(e) => updateIngredient(ing.id, "unit", e.target.value)}
                placeholder="g"
                className="form-input w-16 text-center"
                aria-label="Einheit"
              />
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                placeholder="Spaghetti"
                className="form-input flex-1"
                aria-label="Zutat"
              />
              <button
                type="button"
                onClick={() => removeIngredientRow(ing.id)}
                aria-label="Zutat entfernen"
                className="flex w-9 shrink-0 items-center justify-center text-ink-soft"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredientRow}
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-olive"
        >
          <Plus size={16} /> Zutat hinzufügen
        </button>
      </Field>

      <Field label="Zubereitung (ein Schritt pro Zeile)">
        <textarea
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          rows={6}
          placeholder={"Wasser salzen und Spaghetti kochen\nKnoblauch anbraten\n…"}
          className="form-input"
        />
      </Field>

      <Field label="Notizen">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="z. B. „Nächstes Mal weniger Salz“, „War beim zweiten Mal besser“…"
          className="form-input resize-none"
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 rounded-[var(--radius-chip)] bg-olive py-3 text-sm font-semibold text-cream"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[var(--radius-chip)] border border-sand-line px-5 py-3 text-sm font-medium text-ink"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, required, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-olive">*</span>}
      </span>
      {children}
    </label>
  );
}
