// Zutaten sind seit Phase 6 strukturiert: { id, amount, unit, name }
// statt reiner Freitext-Zeilen. normalizeIngredients() sorgt dafür,
// dass auch Rezepte aus früheren Phasen (reine Strings) weiterhin
// funktionieren, statt beim Bearbeiten zu crashen.

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `ing_${Date.now()}_${idCounter}`;
}

export function normalizeIngredients(ingredients) {
  return (ingredients || []).map((ing) => {
    if (typeof ing === "string") {
      return { id: nextId(), amount: "", unit: "", name: ing };
    }
    return { id: ing.id || nextId(), amount: ing.amount || "", unit: ing.unit || "", name: ing.name || "" };
  });
}

/** Formatiert eine strukturierte Zutat für die Anzeige, z. B. "250 g Spaghetti". */
export function formatIngredient(ing) {
  const parts = [ing.amount, ing.unit, ing.name].filter((p) => p && String(p).trim().length > 0);
  return parts.join(" ");
}

/**
 * Versucht eine Mengenangabe in eine Zahl umzuwandeln, für die
 * Einkaufslisten-Summierung. Versteht Kommas ("1,5") und einfache
 * Brüche ("1/2"). Gibt null zurück, wenn es keine reine Zahl ist
 * (z. B. "etwas", "nach Geschmack") – solche Mengen werden in der
 * Einkaufsliste dann als Text statt summiert angezeigt.
 */
export function parseAmount(amountText) {
  if (!amountText) return null;
  const text = String(amountText).trim().replace(",", ".");

  if (/^\d+\/\d+$/.test(text)) {
    const [num, denom] = text.split("/").map(Number);
    return denom !== 0 ? num / denom : null;
  }
  const num = Number(text);
  return Number.isFinite(num) ? num : null;
}

/** Formatiert eine summierte Zahl wieder hübsch (keine unnötigen Nachkommastellen). */
export function formatAmount(num) {
  const rounded = Math.round(num * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(".", ",");
}

/**
 * Skaliert eine einzelne Mengenangabe um den Faktor (z. B. 0.5 für halbe
 * Portionen). Nicht-numerische Mengen ("etwas", "nach Geschmack") werden
 * unverändert zurückgegeben, da sie sich nicht sinnvoll skalieren lassen.
 */
export function scaleAmount(amountText, factor) {
  const num = parseAmount(amountText);
  if (num === null) return amountText;
  return formatAmount(num * factor);
}

// Claude lässt Mengen/Einheiten beim Extrahieren bewusst unverändert (nur
// der Cup-Wert wird separat in eine metrische Größe umgerechnet, siehe
// Backend). Englische Einheiten wie tbsp/tsp/oz/lb bleiben deshalb nach
// dem Import unangetastet stehen – das ist das Signal dafür, dass wir dem
// Nutzer den "Mengen bitte prüfen"-Hinweis zeigen sollten.
const ENGLISH_UNIT_PATTERN =
  /^(tbsp|tbs|tablespoons?|tsp|teaspoons?|cups?|fl\.?\s?oz|oz|ounces?|lbs?|pounds?|pt|pints?|qt|quarts?|gal|gallons?)$/i;

/** Prüft, ob mindestens eine Zutat noch eine unübersetzte englische Einheit hat. */
export function hasEnglishUnits(ingredients) {
  return (ingredients || []).some((ing) => {
    const unit = typeof ing === "string" ? "" : ing.unit || "";
    return ENGLISH_UNIT_PATTERN.test(unit.trim());
  });
}
