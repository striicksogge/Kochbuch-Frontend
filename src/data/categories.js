// Zentrale Kategorien-Konfiguration. Eine Änderung/Erweiterung hier
// wirkt sich automatisch auf Auswahl-UI, Formular und Kategorie-Seiten aus.

import { getCustomCategories } from "./customCategories";

export const CATEGORY_GROUPS = [
  {
    id: "mahlzeit",
    label: "Mahlzeit",
    emoji: "🍽️",
    options: ["Frühstück", "Hauptmahlzeit", "Snack", "Dessert", "Getränke"],
  },
  {
    id: "ernaehrung",
    label: "Ernährung",
    emoji: "🥗",
    options: ["High Protein", "Low Carb", "Kalorienarm", "Soulfood", "Vegetarisch", "Vegan", "Glutenfrei"],
  },
  {
    id: "hauptzutat",
    label: "Hauptzutat",
    emoji: "🍖",
    options: [
      "Hähnchen",
      "Rind",
      "Schwein",
      "Hackfleisch",
      "Fisch/Meeresfrüchte",
      "Kartoffeln",
      "Reis",
      "Reispapier",
      "Nudeln",
      "Gemüse",
      "Backwaren",
    ],
  },
  {
    id: "kueche",
    label: "Küche",
    emoji: "🌍",
    options: [
      "Italienisch",
      "Asiatisch",
      "Mexikanisch",
      "Indisch",
      "Mediterran",
      "Türkisch",
      "Amerikanisch",
      "Deutsch",
      "Französisch",
      "Thai",
      "Japanisch",
      "Chinesisch",
      "Koreanisch",
    ],
  },
  {
    id: "gericht",
    label: "Gericht",
    emoji: "🍳",
    options: [
      "Pasta",
      "Pizza",
      "Bowl",
      "Burger",
      "Wrap",
      "Salat",
      "Suppe",
      "Auflauf",
      "Sandwich",
      "Ofengericht",
      "Pfannengericht",
      "Grillgericht",
    ],
  },
  {
    id: "zubereitung",
    label: "Zubereitung",
    emoji: "⏱️",
    options: ["Schnell (<15 Min.)", "Einfach", "Meal Prep", "One Pot", "Airfryer", "Slow Cooker"],
  },
  {
    id: "eigene",
    label: "Eigene Kategorien",
    emoji: "❤️",
    options: ["Favoriten", "Bereits gekocht", "Noch nicht gekocht", "Eigene Kreationen"],
  },
];

/** Alle fest eingebauten Kategorie-Optionen flach, z. B. für Suche/Validierung. */
export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.options);

/**
 * Kategorie-Gruppen inklusive nutzergenerierter Kategorien (siehe
 * data/customCategories.js), angehängt an die Gruppe "Eigene
 * Kategorien". Für die Auswahl-UI (CategorySelector) statt der
 * statischen CATEGORY_GROUPS.
 */
export function getCategoryGroupsWithCustom() {
  const custom = getCustomCategories();
  if (custom.length === 0) return CATEGORY_GROUPS;
  return CATEGORY_GROUPS.map((g) =>
    g.id === "eigene" ? { ...g, options: [...g.options, ...custom] } : g
  );
}

/** Alle Kategorien inklusive nutzergenerierter - für Validierung/Cleanup. */
export function getAllCategoriesIncludingCustom() {
  return [...ALL_CATEGORIES, ...getCustomCategories()];
}
