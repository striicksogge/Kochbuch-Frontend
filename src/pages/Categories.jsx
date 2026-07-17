import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Flame, Download, Upload } from "lucide-react";
import { CATEGORY_GROUPS } from "../data/categories";
import { useRecipes } from "../context/RecipesContext";
import { exportData, importDataFromFile } from "../data/backup";

/**
 * Übersicht aller Kategorien zum Durchstöbern (Ersatz für den früheren
 * "Mehr"-Platzhalter). Jede Option verlinkt auf ihre eigene
 * Kategorie-Seite (/category/:name) mit den passenden Rezepten.
 * Am Ende außerdem Export/Import als einfaches Backup.
 */
export default function Categories() {
  const { recipes } = useRecipes();
  const [backupMessage, setBackupMessage] = useState("");
  const [backupError, setBackupError] = useState("");
  const fileInputRef = useRef(null);

  function countFor(option) {
    return recipes.filter((r) => (r.categories || []).includes(option)).length;
  }

  function handleExport() {
    const count = exportData();
    setBackupError("");
    setBackupMessage(`${count} Rezept${count !== 1 ? "e" : ""} exportiert.`);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // damit dieselbe Datei erneut ausgewählt werden kann
    if (!file) return;

    const confirmed = window.confirm(
      "Import überschreibt alle aktuell gespeicherten Rezepte, den Essensplan und die Einkaufsliste mit dem Inhalt dieser Datei. Fortfahren?"
    );
    if (!confirmed) return;

    try {
      const count = await importDataFromFile(file);
      setBackupError("");
      setBackupMessage(`${count} Rezept${count !== 1 ? "e" : ""} importiert. Seite wird neu geladen …`);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setBackupMessage("");
      setBackupError(err.message);
    }
  }

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Kategorien</h1>
      <p className="mt-1 text-sm text-ink-soft">Stöbere durch dein Kochbuch nach Thema.</p>

      <div className="mt-6 space-y-7">
        <section>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Schnellfilter
          </p>
          <Link
            to="/low-calorie"
            className="flex items-center gap-2 rounded-[var(--radius-chip)] border border-olive bg-olive/10 px-3.5 py-2 text-sm text-olive-deep w-fit"
          >
            <Flame size={15} /> Unter 600 kcal
          </Link>
        </section>

        {CATEGORY_GROUPS.map((group) => (
          <section key={group.id}>
            <h2 className="mb-3 flex items-center gap-2 font-display text-base font-medium text-ink">
              <span>{group.emoji}</span>
              {group.label}
            </h2>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const count = countFor(option);
                return (
                  <Link
                    key={option}
                    to={`/category/${encodeURIComponent(option)}`}
                    className={`rounded-[var(--radius-chip)] border px-3.5 py-2 text-sm ${
                      count > 0
                        ? "border-olive bg-olive/10 text-olive-deep"
                        : "border-sand-line bg-cream-card text-ink-soft"
                    }`}
                  >
                    {option}
                    {count > 0 && <span className="ml-1 text-xs">({count})</span>}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <section>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Daten-Backup
          </p>
          <div className="rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-4">
            <p className="mb-3 text-xs text-ink-soft">
              Sichert Rezepte, Essensplan und Einkaufsliste als Datei auf deinem Gerät –
              nützlich vor einem Handywechsel oder einfach zwischendurch.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-chip)] bg-olive py-2.5 text-sm font-semibold text-cream"
              >
                <Download size={16} /> Exportieren
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line py-2.5 text-sm font-medium text-ink"
              >
                <Upload size={16} /> Importieren
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleFileSelected}
                className="hidden"
              />
            </div>
            {backupMessage && <p className="mt-2 text-xs text-olive-deep">{backupMessage}</p>}
            {backupError && <p className="mt-2 text-xs text-red-700">{backupError}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
