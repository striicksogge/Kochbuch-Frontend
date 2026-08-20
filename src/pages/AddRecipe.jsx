import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Link2, PenLine, Layers, Loader2, CopyCheck, ClipboardPaste, Check, X } from "lucide-react";
import { useRecipes } from "../context/RecipesContext";
import { importFromLink, extractFromText } from "../data/extractApi";
import { hasEnglishUnits } from "../data/ingredients";
import {
  isTesterMode,
  getImportsRemaining,
  hasReachedImportLimit,
  recordSuccessfulImport,
  TESTER_IMPORT_LIMIT,
} from "../data/testerMode";
import { findRecipeByTitle } from "../data/recipeStorage";
import { isThumbnailDownloadEnabled } from "../data/imageDownloadSetting";
import RecipeFormFields from "../components/RecipeFormFields";
import ImageDisclaimerBanner from "../components/ImageDisclaimerBanner";
import EnglishUnitsNotice, { isEnglishUnitsNoticeHidden } from "../components/EnglishUnitsNotice";
import DuplicateTitleModal from "../components/DuplicateTitleModal";

/**
 * Rezept anlegen – zwei Wege:
 *  1) Von Link importieren (TikTok/Instagram/Pinterest) über das
 *     bestehende Backend, Ergebnis wird danach zur Kontrolle im
 *     selben Formular wie bei der manuellen Eingabe angezeigt.
 *  2) Direkt manuell eingeben.
 *
 * "mode" steuert, welcher Schritt gerade angezeigt wird:
 *   "choose" -> "linkInput" -> "review"        (Import-Weg, Caption enthielt was)
 *   "choose" -> "linkInput" -> "textFallback" -> "review"
 *       (Import-Weg, aber Caption war leer - Rezept steht vermutlich nur
 *        im Video oder in den Kommentaren. Der Nutzer kopiert sich den
 *        Text selbst zusammen (kein automatisiertes Video-/Kommentar-
 *        Scraping) und fügt ihn ein, dieselbe Claude-Extraktion läuft
 *        darüber wie sonst auch.)
 *   "choose" -> "manual"                        (manueller Weg, = "review" ohne Vorbefüllung)
 *
 * Einfacher Duplikat-Check (Phase 9): derselbe Link wird nicht zweimal
 * importiert, sondern es gibt einen Hinweis mit Link zum bestehenden
 * Rezept. Ein inhaltlicher Vergleich (anderer Link, gleiches Rezept)
 * findet bewusst nicht statt – das wäre ein deutlich größerer Aufwand.
 */
// Der "Bearbeiten"-Link in der Mehrfach-Import-Ergebnisliste führt auf eine
// eigene Seite (RecipeForm.jsx, Route /recipe/:id/edit) - beim Zurücknavigieren
// wird AddRecipe komplett neu gemountet und normaler React-State (useState)
// ist dann weg, man landet wieder im leeren Auswahlmenü. Die Ergebnisliste
// deshalb zusätzlich in sessionStorage spiegeln (überlebt nur den Tab, nicht
// gedacht als dauerhafte Speicherung) und beim Mounten wiederherstellen.
const BULK_SESSION_KEY = "kochbuch_v2_bulk_import_session";

function loadBulkSession() {
  try {
    const raw = sessionStorage.getItem(BULK_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveBulkSession(results) {
  try {
    sessionStorage.setItem(BULK_SESSION_KEY, JSON.stringify(results));
  } catch {
    // Bloß eine Komfort-Wiederherstellung - wenn sessionStorage aus
    // irgendeinem Grund nicht schreibbar ist, einfach ohne sie weitermachen.
  }
}

function clearBulkSession() {
  sessionStorage.removeItem(BULK_SESSION_KEY);
}

export default function AddRecipe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { recipes, addRecipe } = useRecipes();

  const restoredBulkResults = loadBulkSession();
  const [mode, setMode] = useState(restoredBulkResults ? "bulkInput" : "choose");
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importWarning, setImportWarning] = useState("");
  const [prefill, setPrefill] = useState(null); // Ergebnis des Imports, für das Formular
  const [duplicateRecipe, setDuplicateRecipe] = useState(null);
  const [pendingSave, setPendingSave] = useState(null); // { data, existingRecipe } bei Titel-Dopplung
  const [showEnglishUnitsNotice, setShowEnglishUnitsNotice] = useState(false);

  const [manualText, setManualText] = useState("");
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [textFallbackError, setTextFallbackError] = useState("");

  const [bulkText, setBulkText] = useState("");
  const [bulkResults, setBulkResults] = useState(restoredBulkResults); // Array während/nach Mehrfach-Import
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [saveError, setSaveError] = useState("");

  function normalizeUrl(u) {
    return u.trim().replace(/\/+$/, "").toLowerCase();
  }

  // Kern der Import-Logik, unabhängig vom Formular-Submit nutzbar - siehe
  // useEffect unten für den automatischen Start via Share-Target
  // (?sharedUrl=..., TikTok "Teilen" -> direkt REZIPI, siehe App.jsx).
  async function runImport(targetUrl) {
    setImportError("");
    setImportWarning("");
    setDuplicateRecipe(null);
    setSaveError("");

    if (!targetUrl.trim()) {
      setImportError("Bitte zuerst einen Link einfügen.");
      return;
    }
    try {
      new URL(targetUrl);
    } catch {
      setImportError("Das sieht nicht wie ein gültiger Link aus.");
      return;
    }

    // Testversion: Instagram-Import funktioniert praktisch nie (siehe
    // project-context.md), deshalb in der Testphase gar nicht erst
    // versuchen, statt Testern einen fehlschlagenden Import zuzumuten.
    if (isTesterMode() && targetUrl.toLowerCase().includes("instagram.com")) {
      setImportError(
        "Instagram wird in der Testversion nicht unterstützt (der automatische Import funktioniert dort kaum). Bitte einen TikTok- oder Pinterest-Link verwenden."
      );
      return;
    }

    // Einfacher Duplikat-Check: gleicher Link bereits gespeichert?
    const existing = recipes.find(
      (r) => r.sourceUrl && normalizeUrl(r.sourceUrl) === normalizeUrl(targetUrl)
    );
    if (existing) {
      setDuplicateRecipe(existing);
      return;
    }

    setIsImporting(true);
    try {
      const result = await importFromLink(targetUrl, { embedImage: isThumbnailDownloadEnabled() });
      const newPrefill = {
        title: result.title || "",
        image: result.image || "",
        ingredients: result.ingredients || [],
        steps: result.steps || [],
        cookTime: result.cookTime || "",
        servings: result.servings || "",
        caloriesPerServing: result.caloriesPerServing || "",
        sourceUrl: targetUrl,
        platform: result.platform || null,
      };
      // Praktisch nichts gefunden (Titel leer, keine Zutaten, keine
      // Schritte) -> das Rezept steht vermutlich nicht in der Caption,
      // sondern nur im Video oder in den Kommentaren.
      const foundNothing =
        !newPrefill.title && newPrefill.ingredients.length === 0 && newPrefill.steps.length === 0;

      // Testversion: Statt des Text-Fallbacks (der ein manuelles
      // Ergänzen durch den Tester wäre) nur ein Hinweis, mit einem
      // anderen Video erneut zu versuchen. Zählt nicht als Import,
      // weil nichts gespeichert wurde.
      if (foundNothing && isTesterMode()) {
        setImportError("Für diesen Link konnte kein Rezept gefunden werden. Bitte mit einem anderen Video versuchen.");
        return;
      }

      setPrefill(newPrefill);
      if (result.warning) setImportWarning(result.warning);
      if (hasEnglishUnits(newPrefill.ingredients) && !isEnglishUnitsNoticeHidden()) {
        setShowEnglishUnitsNotice(true);
      }
      setMode(foundNothing ? "textFallback" : "review");
    } catch (err) {
      console.error(err);
      setImportError(
        "Import fehlgeschlagen (Server nicht erreichbar oder überlastet). Du kannst es erneut versuchen oder das Rezept manuell anlegen."
      );
    } finally {
      setIsImporting(false);
    }
  }

  function handleImport(e) {
    e.preventDefault();
    runImport(url);
  }

  // Über TikTok "Teilen" -> REZIPI (Share-Target, siehe App.jsx) direkt
  // hierher navigiert: Link ist schon bekannt, Import startet sofort statt
  // erst "Von Link importieren" antippen und den Link einfügen zu müssen.
  useEffect(() => {
    const shared = searchParams.get("sharedUrl");
    if (shared) {
      setUrl(shared);
      setMode("linkInput");
      runImport(shared);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mehrfach-Import: ein Link pro Zeile, läuft nacheinander (nicht
  // parallel) durch dieselbe Import-Logik wie der Einzel-Import, speichert
  // aber jedes gefundene Rezept SOFORT ohne Kontrollschritt (der wäre bei
  // vielen Links zu mühsam - "in einem Abwasch"). Jedes so angelegte
  // Rezept bleibt danach ganz normal bearbeitbar wie jedes andere auch
  // (Kategorien etc. lassen sich über "Bearbeiten" im Ergebnis nachtragen).
  async function runBulkImport() {
    const urls = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (urls.length === 0) return;

    setIsBulkRunning(true);
    const results = [];
    setBulkResults(results);

    function updateResults() {
      const snapshot = [...results];
      setBulkResults(snapshot);
      saveBulkSession(snapshot);
    }

    for (const targetUrl of urls) {
      let entry;
      try {
        new URL(targetUrl);
      } catch {
        results.push({ url: targetUrl, status: "failed", reason: "Ungültiger Link" });
        updateResults();
        continue;
      }

      if (isTesterMode() && hasReachedImportLimit()) {
        results.push({ url: targetUrl, status: "skipped", reason: "Test-Limit erreicht" });
        updateResults();
        continue;
      }
      if (isTesterMode() && targetUrl.toLowerCase().includes("instagram.com")) {
        results.push({ url: targetUrl, status: "failed", reason: "Instagram in Testversion nicht unterstützt" });
        updateResults();
        continue;
      }

      const existingByUrl = recipes.find(
        (r) => r.sourceUrl && normalizeUrl(r.sourceUrl) === normalizeUrl(targetUrl)
      );
      if (existingByUrl) {
        results.push({
          url: targetUrl,
          status: "skipped",
          reason: "Schon importiert",
          recipeId: existingByUrl.id,
          title: existingByUrl.title,
        });
        updateResults();
        continue;
      }

      try {
        const result = await importFromLink(targetUrl, { embedImage: isThumbnailDownloadEnabled() });
        const foundNothing =
          !result.title && (!result.ingredients || result.ingredients.length === 0) &&
          (!result.steps || result.steps.length === 0);
        if (foundNothing) {
          results.push({ url: targetUrl, status: "failed", reason: "Kein Rezept gefunden" });
          updateResults();
          continue;
        }
        const created = await addRecipe({
          title: result.title || "",
          image: result.image || "",
          ingredients: result.ingredients || [],
          steps: result.steps || [],
          cookTime: result.cookTime || "",
          servings: result.servings || "",
          caloriesPerServing: result.caloriesPerServing || "",
          sourceUrl: targetUrl,
          platform: result.platform || null,
        });
        if (isTesterMode()) recordSuccessfulImport();
        entry = { url: targetUrl, status: "success", recipeId: created.id, title: created.title };
      } catch (err) {
        console.error(err);
        entry = { url: targetUrl, status: "failed", reason: "Import fehlgeschlagen" };
        results.push(entry);
        updateResults();
        continue;
      }
      results.push(entry);
      updateResults();
    }

    setIsBulkRunning(false);
  }

  async function handleExtractFromText() {
    if (!manualText.trim()) {
      setTextFallbackError("Bitte zuerst Text einfügen.");
      return;
    }
    setTextFallbackError("");
    setIsExtractingText(true);
    try {
      const result = await extractFromText(manualText);
      setPrefill((prev) => ({
        ...prev,
        title: result.title || prev?.title || "",
        ingredients: result.ingredients?.length ? result.ingredients : prev?.ingredients || [],
        steps: result.steps?.length ? result.steps : prev?.steps || [],
        cookTime: result.cookTime || prev?.cookTime || "",
        servings: result.servings || prev?.servings || "",
        caloriesPerServing: result.caloriesPerServing || prev?.caloriesPerServing || "",
      }));
      if (hasEnglishUnits(result.ingredients) && !isEnglishUnitsNoticeHidden()) {
        setShowEnglishUnitsNotice(true);
      }
      setMode("review");
    } catch (err) {
      console.error(err);
      setTextFallbackError("Auswertung fehlgeschlagen. Du kannst es erneut versuchen oder das Rezept manuell ausfüllen.");
    } finally {
      setIsExtractingText(false);
    }
  }

  async function saveRecipe(data) {
    setSaveError("");
    let created;
    try {
      created = await addRecipe({
        ...data,
        sourceUrl: prefill?.sourceUrl || null,
        platform: prefill?.platform || null,
      });
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Speichern fehlgeschlagen.");
      return;
    }
    if (isTesterMode() && prefill?.sourceUrl) {
      recordSuccessfulImport();
    }
    navigate(`/recipe/${created.id}`);
  }

  function handleSubmit(data) {
    const titleMatch = findRecipeByTitle(recipes, data.title);
    if (titleMatch) {
      setPendingSave({ data, existingRecipe: titleMatch });
      return;
    }
    saveRecipe(data);
  }

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={() => {
            if (mode === "choose") {
              navigate(-1);
              return;
            }
            clearBulkSession();
            setMode("choose");
          }}
          aria-label="Zurück"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-semibold text-ink">Neues Rezept</h1>
      </div>

      {mode === "choose" && (
        <div className="mt-6 space-y-3 px-4">
          {isTesterMode() && (
            <p className="text-center text-xs text-ink-soft">
              Testversion – noch {getImportsRemaining()} von {TESTER_IMPORT_LIMIT} Test-Importen übrig
            </p>
          )}

          {isTesterMode() && hasReachedImportLimit() ? (
            <div className="rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-4 text-center text-sm text-ink-soft">
              Du hast dein Test-Limit von {TESTER_IMPORT_LIMIT} importierten Rezepten erreicht.
              Danke fürs Testen! 🎉
              <br />
              Du kannst die App weiter ganz normal nutzen (Rezepte ansehen, Essensplan,
              Einkaufsliste, Suche, manuell Rezepte anlegen) – nur der Link-Import ist jetzt
              gesperrt.
            </div>
          ) : (
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
                  {isTesterMode()
                    ? "TikTok oder Pinterest – Titel/Bild/Zutaten werden automatisch befüllt"
                    : "TikTok, Instagram oder Pinterest – Titel/Bild/Zutaten werden automatisch befüllt"}
                </span>
              </span>
            </button>
          )}

          {!(isTesterMode() && hasReachedImportLimit()) && (
            <button
              type="button"
              onClick={() => {
                clearBulkSession();
                setBulkText("");
                setBulkResults(null);
                setMode("bulkInput");
              }}
              className="flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-sand-line bg-cream-card p-4 text-left"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
                <Layers size={20} />
              </span>
              <span>
                <span className="block font-display text-base font-medium text-ink">
                  Mehrere Links importieren
                </span>
                <span className="block text-xs text-ink-soft">
                  Ein Link pro Zeile, wird nacheinander importiert
                </span>
              </span>
            </button>
          )}

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

      {mode === "bulkInput" && (
        <div className="mt-6 space-y-3 px-4">
          {!bulkResults ? (
            <>
              <p className="text-sm text-ink-soft">
                Ein Link pro Zeile. Jedes gefundene Rezept wird direkt gespeichert (kein
                Kontrollschritt) – Kategorien & Co. lässt sich danach für jedes einzeln
                nachtragen.
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={8}
                placeholder={"https://www.tiktok.com/@…\nhttps://www.tiktok.com/@…\n…"}
                className="form-input"
                autoFocus
              />
              <button
                type="button"
                onClick={runBulkImport}
                disabled={!bulkText.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-olive py-3 text-sm font-semibold text-cream disabled:opacity-70"
              >
                Importieren
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-soft">
                {isBulkRunning
                  ? `Importiere … (${bulkResults.length}/${bulkText.split("\n").map((l) => l.trim()).filter(Boolean).length})`
                  : `Fertig: ${bulkResults.filter((r) => r.status === "success").length} importiert, ${bulkResults.filter((r) => r.status !== "success").length} übersprungen/fehlgeschlagen.`}
              </p>
              <div className="space-y-1.5">
                {bulkResults.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-[var(--radius-card)] border border-sand-line bg-cream-card px-3 py-2.5"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        r.status === "success" ? "bg-olive/10 text-olive" : "bg-honey/10 text-honey"
                      }`}
                    >
                      {r.status === "success" ? <Check size={14} /> : <X size={14} />}
                    </span>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="truncate text-ink">{r.title || r.url}</p>
                      {r.reason && <p className="text-xs text-ink-soft">{r.reason}</p>}
                    </div>
                    {r.recipeId && (
                      <Link
                        to={`/recipe/${r.recipeId}/edit`}
                        className="shrink-0 text-xs font-medium text-olive underline"
                      >
                        Bearbeiten
                      </Link>
                    )}
                  </div>
                ))}
                {isBulkRunning && (
                  <div className="flex items-center gap-2.5 rounded-[var(--radius-card)] border border-sand-line bg-cream-card px-3 py-2.5 text-sm text-ink-soft">
                    <Loader2 size={16} className="animate-spin shrink-0" /> Wird importiert …
                  </div>
                )}
              </div>
              {!isBulkRunning && (
                <button
                  type="button"
                  onClick={() => {
                    clearBulkSession();
                    navigate("/all-recipes");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-olive py-3 text-sm font-semibold text-cream"
                >
                  Fertig
                </button>
              )}
            </>
          )}
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
                Wird importiert …
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

      {mode === "textFallback" && (
        <div className="mt-6 space-y-3 px-4">
          <div className="rounded-[var(--radius-card)] border border-honey/40 bg-honey/10 p-3">
            <p className="text-sm text-ink">
              In der Beschreibung stand kein Rezept – vermutlich wird es im Video gesagt oder steht in den Kommentaren.
            </p>
            <p className="mt-1.5 text-xs text-ink-soft">
              Schau's dir in TikTok an und kopier den Text hier rein (Zutaten, Zubereitung – so wie du ihn findest). Wir strukturieren ihn für dich.
            </p>
          </div>

          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={8}
            placeholder={"z. B. aus einem Kommentar oder mitgeschrieben:\n250g Mehl, 2 Eier, 1 Prise Salz...\nAlles vermischen, 10 Min. backen..."}
            className="form-input"
            autoFocus
          />

          {textFallbackError && <p className="text-sm text-red-700">{textFallbackError}</p>}

          <button
            type="button"
            onClick={handleExtractFromText}
            disabled={isExtractingText}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-olive py-3 text-sm font-semibold text-cream disabled:opacity-70"
          >
            {isExtractingText ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Wird ausgewertet …
              </>
            ) : (
              <>
                <ClipboardPaste size={16} /> Text strukturieren
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode("review")}
            className="w-full text-center text-sm text-ink-soft underline"
          >
            Ohne das weiter, selbst ausfüllen
          </button>
        </div>
      )}

      {showEnglishUnitsNotice && (
        <EnglishUnitsNotice onClose={() => setShowEnglishUnitsNotice(false)} />
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
          {prefill?.sourceUrl && prefill?.image && !isThumbnailDownloadEnabled() && (
            <div className="mx-4 mt-3">
              <ImageDisclaimerBanner previewUrl={prefill.image} />
            </div>
          )}
          {saveError && (
            <p className="mx-4 mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>
          )}
          <RecipeFormFields
            initialValues={prefill || {}}
            onSubmit={handleSubmit}
            onCancel={() => setMode("choose")}
            submitLabel="Rezept speichern"
          />
        </>
      )}

      {pendingSave && (
        <DuplicateTitleModal
          existingRecipe={pendingSave.existingRecipe}
          onConfirm={() => {
            saveRecipe(pendingSave.data);
            setPendingSave(null);
          }}
          onCancel={() => setPendingSave(null)}
        />
      )}
    </div>
  );
}
