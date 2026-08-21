import { useState, useRef } from "react";
import { X, Loader2, Check } from "lucide-react";
import { exportData, importDataFromFile } from "../data/backup";
import { sendFeedback } from "../data/feedbackApi";
import { getCustomCategories, addCustomCategory, removeCustomCategory } from "../data/customCategories";
import { getTheme, setTheme } from "../data/theme";
import { useAuth } from "../context/AuthContext";
import { useRecipes } from "../context/RecipesContext";
import ImportModeModal from "./ImportModeModal";

/**
 * Die sechs "Weiteres"-Panels (Import/Export, Kategorien, Fehler/Ideen,
 * Darstellung, Bild-Download), ausgelagert aus WeiteresMenu.jsx, damit
 * sowohl der mobile Speed-Dial-Trigger (WeiteresMenu.jsx) als auch das
 * Untermenü der Desktop-Seitenleiste (Sidebar.jsx) dieselben Panels
 * ohne Duplikation öffnen können - nur der Trigger unterscheidet sich,
 * der Panel-Inhalt ist auf beiden Wegen identisch.
 */
export default function WeiteresPanels({ activePanel, onClose }) {
  return (
    <>
      {activePanel === "import-export" && <ImportExportPanel onClose={onClose} />}
      {activePanel === "add-category" && <AddCategoryPanel onClose={onClose} />}
      {activePanel === "theme" && <ThemePanel onClose={onClose} />}
      {activePanel === "bug" && (
        <FeedbackFormPanel
          title="Fehler melden"
          category="bug"
          placeholder="Was ist passiert? z. B. „Beim Import von einem TikTok-Link ist die Kochzeit leer geblieben.“"
          onClose={onClose}
        />
      )}
      {activePanel === "idea" && (
        <FeedbackFormPanel
          title="Ideen für REZIPI"
          category="idea"
          placeholder="Was schwebt dir vor?"
          onClose={onClose}
        />
      )}
    </>
  );
}

function FloatingPanel({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-24 sm:items-center sm:pb-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[var(--radius-card)] bg-cream-card p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-medium text-ink">{title}</p>
          <button type="button" onClick={onClose} aria-label="Schließen" className="text-ink-soft">
            <X size={18} />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function ImportExportPanel({ onClose }) {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const fileInputRef = useRef(null);
  const [pendingImportFile, setPendingImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  function handleImportChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setPendingImportFile(file);
  }

  async function handleImportModeChosen(mode) {
    const file = pendingImportFile;
    setPendingImportFile(null);
    if (!file) return;
    setIsImporting(true);
    try {
      const count = await importDataFromFile(user.uid, file, recipes, mode);
      const verb = mode === "merge" ? "hinzugefügt" : "importiert";
      window.alert(`${count} Rezept${count !== 1 ? "e" : ""} ${verb}.`);
    } catch (err) {
      window.alert(err.message);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <FloatingPanel title="Import/Export" onClose={onClose}>
      <p className="text-sm text-ink-soft">
        Sichere alle Rezepte, den Essensplan und die Einkaufsliste als Datei, oder spiele
        ein vorheriges Backup wieder ein.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => exportData(recipes)}
          className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream px-4 py-2 text-sm font-medium text-ink"
        >
          Backup exportieren
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="flex items-center gap-1.5 rounded-[var(--radius-chip)] border border-sand-line bg-cream px-4 py-2 text-sm font-medium text-ink disabled:opacity-60"
        >
          {isImporting && <Loader2 size={14} className="animate-spin" />}
          Backup importieren
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImportChange}
        />
      </div>

      {pendingImportFile && (
        <ImportModeModal
          onChoose={handleImportModeChosen}
          onCancel={() => setPendingImportFile(null)}
        />
      )}
    </FloatingPanel>
  );
}

const THEME_OPTIONS = [
  { id: "system", label: "System" },
  { id: "light", label: "Hell" },
  { id: "dark", label: "Dunkel" },
];

function ThemePanel({ onClose }) {
  const [theme, setThemeState] = useState(getTheme);

  function choose(id) {
    setTheme(id);
    setThemeState(id);
  }

  return (
    <FloatingPanel title="Darstellung" onClose={onClose}>
      <div className="space-y-2">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => choose(opt.id)}
            className={`w-full rounded-[var(--radius-chip)] px-4 py-2.5 text-sm font-medium ${
              theme === opt.id ? "bg-olive text-cream" : "border border-sand-line bg-cream text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </FloatingPanel>
  );
}

function AddCategoryPanel({ onClose }) {
  const [categories, setCategories] = useState(getCustomCategories);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    const added = addCustomCategory(name);
    if (!added) {
      setError("Diese Kategorie gibt es schon.");
      return;
    }
    setCategories(getCustomCategories());
    setName("");
    setError("");
  }

  function handleRemove(cat) {
    removeCustomCategory(cat);
    setCategories(getCustomCategories());
  }

  return (
    <FloatingPanel title="Kategorien hinzufügen" onClose={onClose}>
      <p className="text-sm text-ink-soft">
        Eigene Kategorien stehen danach beim Anlegen/Bearbeiten eines Rezepts unter „Eigene
        Kategorien" zur Auswahl.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="z. B. Ofengemüse"
          className="form-input flex-1"
          autoFocus
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-[var(--radius-chip)] bg-olive px-4 text-sm font-semibold text-cream"
        >
          Hinzufügen
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}

      {categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleRemove(c)}
              className="flex items-center gap-1 rounded-[var(--radius-chip)] bg-ink/5 px-2.5 py-1 text-xs text-ink-soft"
              aria-label={`${c} entfernen`}
            >
              {c} ×
            </button>
          ))}
        </div>
      )}
    </FloatingPanel>
  );
}

function FeedbackFormPanel({ title, category, placeholder, onClose }) {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) {
      setError("Bitte kurz beschreiben, worum es geht.");
      return;
    }
    setError("");
    setIsSending(true);
    try {
      await sendFeedback({ category, message, name, email });
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Senden fehlgeschlagen. Bitte gleich nochmal versuchen.");
    } finally {
      setIsSending(false);
    }
  }

  if (sent) {
    return (
      <FloatingPanel title={title} onClose={onClose}>
        <div className="flex items-center gap-2.5 text-sm text-ink">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
            <Check size={16} />
          </span>
          Danke, ist angekommen!
        </div>
      </FloatingPanel>
    );
  }

  return (
    <FloatingPanel title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="form-input"
          autoFocus
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="form-input"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-Mail (optional, falls wir uns melden sollen)"
          className="form-input"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={isSending}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-olive py-2.5 text-sm font-semibold text-cream disabled:opacity-70"
        >
          {isSending ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Wird gesendet …
            </>
          ) : (
            "Absenden"
          )}
        </button>
      </form>
    </FloatingPanel>
  );
}
