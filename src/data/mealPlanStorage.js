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

/** Anzahl der wiederkehrenden Wochenvorlagen, aktuell "Diese Woche" (0) und "Nächste Woche" (1). */
export const WEEK_COUNT = 2;

export const WEEK_LABELS = ["Diese Woche", "Nächste Woche"];

function emptyPlan() {
  return Object.fromEntries(WEEKDAYS.map((d) => [d.key, null]));
}

/**
 * Liest alle Wochenvorlagen, keyed by Wochen-Offset ("0", "1", ...).
 * Altformat (vor der Mehrfach-Wochen-Funktion) hatte die Wochentage
 * direkt auf oberster Ebene statt unter einem Wochen-Offset - wird
 * hier einmalig als Woche "0" ("Diese Woche") interpretiert.
 */
function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (WEEKDAYS.some((d) => d.key in parsed)) {
    return { "0": parsed };
  }
  return parsed;
}

export function getMealPlan(weekOffset = 0) {
  const all = readAll();
  return { ...emptyPlan(), ...all[String(weekOffset)] };
}

export function saveMealPlan(plan, weekOffset = 0) {
  const all = readAll();
  all[String(weekOffset)] = plan;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
