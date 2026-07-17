import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Link2, PenLine, Loader2, CopyCheck } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { importFromLink } from "../data/extractApi";
import RecipeFormFields from "../components/RecipeFormFields";

/**
 * Rezept anlegen – zwei Wege:
 *  1) Von Link importieren (TikTok/Instagram/Pinterest) über das
 *     bestehende Backend, Ergebnis wird danach zur Kontrolle im
 *     selben Formular wie bei der manuellen Eingabe angezeigt.
 *  2) Direkt manuell eingeben.
 *
 * "mode" steuert, welcher Schritt gerade angezeigt wird:
 *   "choose" -> "linkInput" -> "review"   (Import-Weg)
 *   "choose" -> "manual"                   (manueller Weg, = "review" ohne Vorbefüllung)
 *
 * Einfacher Duplikat-Check (Phase 9): derselbe Link wird nicht zweimal
 * importiert, sondern es gibt einen Hinweis mit Link zum bestehenden
 * Rezept. Ein inhaltlicher Vergleich (anderer Link, gleiches Rezept)
 * findet bewusst nicht statt – das wäre ein deutlich größerer Aufwand.
 */
export default function AddRecipe() {
  const navigate = useNavigate();
  const { recipes, addRecipe } = useRecipes();

  const [mode, setMode] = useState("choose");
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importWarning, setImportWarning] = useState("");
  const [prefill, setPrefill] = useState(null); // Ergebnis des Imports, für das Formular
  const [duplicateRecipe, setDuplicateRecipe] = useState(null);

  function normalizeUrl(u) {
    return u.trim().replace(/\/+$/, "").toLowerCase();
  }

  async function handleImport(e) {
    e.preventDefault();
    setImportError("");
    setImportWarning("");
    setDuplicateRecipe(null);

    if (!url.trim()) {
      setImportError("Bitte zuerst einen Link einfügen.");
      return;
    }
    try {
      new URL(url);
    } catch {
      setImportError("Das sieht nicht wie ein gültiger Link aus.");
      return;
    }

    // Einfacher Duplikat-Check: gleicher Link bereits gespeichert?
    const existing = recipes.find(
      (r) => r.sourceUrl && normalizeUrl(r.sourceUrl) === normalizeUrl(url)
    );
    if (existing) {
      setDuplicateRecipe(existing);
      return;
    }

    setIsImporting(true);
    try {
      const result = await importFromLink(url);
      setPrefill({
        title: result.title || "",
        image: result.image || "",
        ingredients: result.ingredients || [],
        steps: result.steps || [],
        cookTime: result.cookTime || "",
        caloriesPerServing: result.caloriesPerServing || "",
        sourceUrl: url,
        platform: result.platform || null,
      });
      if (result.warning) setImportWarning(result.warning);
      setMode("review");
    } catch (err) {
      console.error(err);
      setImportError(
        "Import fehlgeschlagen (Server nicht erreichbar oder überlastet). Du kannst es erneut versuchen oder das Rezept manuell anlegen."
      );
    } finally {
      setIsImporting(false);
    }
  }

  function handleSubmit(data) {
    const created = addRecipe({
      ...data,
      sourceUrl: prefill?.sourceUrl || null,
      platform: prefill?.platform || null,
    });
    navigate(`/recipe/${created.id}`);
  }

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={() => (mode === "choose" ? navigate(-1) : setMode("choose"))}
          aria-label="Zurück"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-semibold text-ink">Neues Rezept</h1>
      </div>

      {mode === "choose" && (
        <div className="mt-6 space-y-3 px-4">
          <button
            type="button"
            onClick={() => setMode("linkInput")}
            className="flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-4 text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
              <Link2 size={20} />
            </span>
            <span>
              <span className="block font-display text-base font-medium text-ink">
                Von Link importieren
              </span>
              <span className="block text-xs text-ink-soft">
                TikTok, Instagram oder Pinterest – Titel/Bild/Zutaten werden automatisch befüllt
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPrefill(null);
              setMode("review");
            }}
            className="flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-4 text-left"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
              <PenLine size={20} />
            </span>
            <span>
              <span className="block font-display text-base font-medium text-ink">
                Manuell eingeben
              </span>
              <span className="block text-xs text-ink-soft">
                Alle Felder von Hand ausfüllen
              </span>
            </span>
          </button>
        </div>
      )}

      {mode === "linkInput" && (
        <form onSubmit={handleImport} className="mt-6 space-y-3 px-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Link</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@…"
              className="form-input"
              autoFocus
            />
          </label>

          {importError && <p className="text-sm text-red-700">{importError}</p>}

          {duplicateRecipe && (
            <div className="flex items-start gap-2.5 rounded-[var(--radius-card)] border border-honey/40 bg-honey/10 p-3">
              <CopyCheck size={18} className="mt-0.5 shrink-0 text-honey" />
              <div className="text-sm">
                <p className="text-ink">Dieses Rezept existiert bereits: <strong>{duplicateRecipe.title}</strong></p>
                <Link to={`/recipe/${duplicateRecipe.id}`} className="mt-1 inline-block text-olive underline">
                  Bestehendes Rezept ansehen
                </Link>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isImporting}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-olive py-3 text-sm font-semibold text-cream disabled:opacity-70"
          >
            {isImporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Wird importiert … (kann beim ersten Mal bis zu 60 Sek. dauern)
              </>
            ) : (
              "Importieren"
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setPrefill(null);
              setMode("review");
            }}
            className="w-full text-center text-sm text-ink-soft underline"
          >
            Stattdessen manuell eingeben
          </button>
        </form>
      )}

      {mode === "review" && (
        <>
          {importWarning && (
            <p className="mx-4 mt-5 rounded-xl bg-honey/15 px-3 py-2 text-xs text-ink">
              {importWarning}
            </p>
          )}
          {prefill && !importWarning && (
            <p className="mx-4 mt-5 text-xs text-ink-soft">
              Importiert – bitte kurz prüfen und bei Bedarf ergänzen, bevor du speicherst.
            </p>
          )}
          <RecipeFormFields
            initialValues={prefill || {}}
            onSubmit={handleSubmit}
            onCancel={() => setMode("choose")}
            submitLabel="Rezept speichern"
          />
        </>
      )}
    </div>
  );
}
