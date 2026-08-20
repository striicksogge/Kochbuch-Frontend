import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import RecipeCard from "../components/RecipeCard";
import { exportData, importDataFromFile } from "../data/backup";
import ImportModeModal from "../components/ImportModeModal";

/**
 * Zeigt wirklich ALLE Rezepte im Grid (im Gegensatz zu Home, wo nur
 * Ausschnitte/Slider zu sehen sind). Erreichbar über "Alle" beim
 * "Zuletzt hinzugefügt"-Bereich auf der Startseite.
 * Enthält außerdem den Export/Import-Zugang fürs Backup, seit die
 * frühere Kategorien-Seite entfernt wurde.
 */
export default function AllRecipesPage() {
  const { recipes } = useRecipes();
  const [sortBy, setSortBy] = useState("newest");
  const fileInputRef = useRef(null);
  const [pendingImportFile, setPendingImportFile] = useState(null);

  const sorted = [...recipes].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title, "de");
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  function handleExport() {
    exportData();
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // erlaubt erneute Auswahl derselben Datei
    if (!file) return;
    setPendingImportFile(file);
  }

  async function handleImportModeChosen(mode) {
    const file = pendingImportFile;
    setPendingImportFile(null);
    if (!file) return;

    try {
      const count = await importDataFromFile(file, mode);
      const verb = mode === "merge" ? "hinzugefügt" : "importiert";
      window.alert(`${count} Rezept${count !== 1 ? "e" : ""} ${verb}. Die Seite wird jetzt neu geladen.`);
      window.location.reload();
    } catch (err) {
      window.alert(err.message);
    }
  }

  return (
    <div className="px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Zurück zur Startseite"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-xl font-semibold text-ink">Alle Rezepte</h1>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          {recipes.length} Rezept{recipes.length !== 1 && "e"}
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-3 py-1.5 text-xs text-ink"
        >
          <option value="newest">Neueste zuerst</option>
          <option value="title">Titel A–Z</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-soft">Noch keine Rezepte im Kochbuch.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
          {sorted.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      <section className="mt-10 border-t border-sand-line pt-5">
        <h2 className="font-display text-base font-medium text-ink">Daten-Backup</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Sichere alle Rezepte, den Essensplan und die Einkaufsliste als Datei, oder spiele
          ein vorheriges Backup wieder ein.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2 text-sm font-medium text-ink"
          >
            <Download size={15} /> Backup exportieren
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream-card px-4 py-2 text-sm font-medium text-ink"
          >
            <Upload size={15} /> Backup importieren
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportChange}
          />
        </div>
      </section>

      {pendingImportFile && (
        <ImportModeModal
          onChoose={handleImportModeChosen}
          onCancel={() => setPendingImportFile(null)}
        />
      )}
    </div>
  );
}
