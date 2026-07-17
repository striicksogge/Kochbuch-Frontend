import { parseAmount, formatAmount } from "./ingredients";

/**
 * Kombiniert die Zutaten mehrerer Rezepte zu einer Einkaufsliste.
 * Gleiche Zutaten (gleicher Name + gleiche Einheit, case-insensitive)
 * werden zusammengefasst und ihre Mengen addiert, sofern numerisch
 * parsbar. Nicht parsbare Mengen (z. B. "etwas", "nach Geschmack")
 * werden als Text gesammelt statt verworfen.
 */
export function buildShoppingList(recipes) {
  const map = new Map();

  recipes.forEach((recipe) => {
    (recipe.ingredients || []).forEach((ing) => {
      // Altes Freitext-Format (aus früheren Phasen) tolerieren
      const name = (typeof ing === "string" ? ing : ing.name || "").trim();
      if (!name) return;
      const unit = (typeof ing === "string" ? "" : ing.unit || "").trim();
      const amountRaw = (typeof ing === "string" ? "" : ing.amount || "").trim();

      const key = `${name.toLowerCase()}|${unit.toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, { name, unit, numericTotal: 0, hasNumeric: false, textAmounts: [] });
      }
      const entry = map.get(key);

      const parsed = parseAmount(amountRaw);
      if (parsed !== null) {
        entry.numericTotal += parsed;
        entry.hasNumeric = true;
      } else if (amountRaw) {
        entry.textAmounts.push(amountRaw);
      }
    });
  });

  return Array.from(map.values())
    .map((entry) => ({
      name: entry.name,
      unit: entry.unit,
      displayAmount: entry.hasNumeric
        ? formatAmount(entry.numericTotal) + (entry.textAmounts.length ? ` + ${entry.textAmounts.join(" + ")}` : "")
        : entry.textAmounts.join(" + ") || null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
}
