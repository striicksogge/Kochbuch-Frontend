/** Formatiert ein ISO-Datum als "heute", "gestern" oder "vor X Tagen". */
export function formatRelativeDate(isoString) {
  const date = new Date(isoString);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "heute";
  if (diffDays === 1) return "gestern";
  if (diffDays < 30) return `vor ${diffDays} Tagen`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `vor ${months} Monat${months > 1 ? "en" : ""}`;
  return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}
