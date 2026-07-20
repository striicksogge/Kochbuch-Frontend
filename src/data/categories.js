// Zentrale Kategorien-Konfiguration. Eine Änderung/Erweiterung hier
// wirkt sich automatisch auf Auswahl-UI, Formular und Kategorie-Seiten aus.

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
    options: ["High Protein", "Low Carb", "Kalorienarm", "Soulfood"],
  },
  {
    id: "hauptzutat",
    label: "Hauptzutat",
    emoji: "🍖",
    options: [
      "Hähnchen",
      "Rind",
      "Schwein",
      "Fisch",
      "Meeresfrüchte",
      "Kartoffeln",
      "Reis",
      "Nudeln",
      "Gemüse",
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

/** Alle Kategorie-Optionen flach, z. B. für Suche/Validierung. */
export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.options);
