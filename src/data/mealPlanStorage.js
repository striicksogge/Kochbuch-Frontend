const STORAGE_KEY = "kochbuch_v2_meal_plan";

export const WEEKDAYS = [
  { key: "mo", label: "Montag" },
  { key: "di", label: "Dienstag" },
  { key: "mi", label: "Mittwoch" },
  { key: "do", label: "Donnerstag" },
  { key: "fr", label: "Freitag" },
  { key: "sa", label: "Samstag" },
  { key: "so", label: "Sonntag" },
];

function emptyPlan() {
  return Object.fromEntries(WEEKDAYS.map((d) => [d.key, null]));
}

export function getMealPlan() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? { ...emptyPlan(), ...JSON.parse(raw) } : emptyPlan();
}

export function saveMealPlan(plan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}
