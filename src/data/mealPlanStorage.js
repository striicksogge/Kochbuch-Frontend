import { getUserData, patchUserDoc } from "./userDoc";

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

export function getMealPlan(weekOffset = 0) {
  const all = getUserData().mealPlan || {};
  return { ...emptyPlan(), ...all[String(weekOffset)] };
}

export function saveMealPlan(plan, weekOffset = 0) {
  const all = { ...(getUserData().mealPlan || {}), [String(weekOffset)]: plan };
  patchUserDoc({ mealPlan: all });
}
