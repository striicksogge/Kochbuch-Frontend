const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://kochbuch-vmiy.onrender.com";

/**
 * Schickt die Sucheingabe + kompakte Rezeptliste ans Backend, bekommt
 * eine nach Relevanz sortierte Liste passender Rezept-IDs zurück.
 */
export async function searchRecipes(query, recipes) {
  const compactRecipes = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    ingredients: r.ingredients,
    categories: r.categories,
    cookTime: r.cookTime,
  }));

  const response = await fetch(`${BACKEND_URL}/search`, {
    method: "POST",
    // Siehe Kommentar in extractApi.js: text/plain vermeidet die
    // fehlschlagende CORS-Preflight-Anfrage auf dieser Render-Instanz.
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ query, recipes: compactRecipes }),
  });

  if (!response.ok) {
    throw new Error(`Backend antwortete mit Status ${response.status}`);
  }

  const data = await response.json();
  return data.matchingIds || [];
}
