const STORAGE_KEY = "kochbuch_v2_shopping_list";

function read() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { selectedRecipeIds: [], checkedKeys: [] };
}

function write(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getShoppingListState() {
  return read();
}

export function saveSelectedRecipeIds(ids) {
  const state = read();
  write({ ...state, selectedRecipeIds: ids });
}

export function saveCheckedKeys(keys) {
  const state = read();
  write({ ...state, checkedKeys: keys });
}
