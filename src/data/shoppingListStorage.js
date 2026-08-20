import { getUserData, patchUserDoc } from "./userDoc";

export function getShoppingListState() {
  return getUserData().shoppingList || { selectedRecipeIds: [], checkedKeys: [] };
}

export function saveSelectedRecipeIds(ids) {
  patchUserDoc({ shoppingList: { ...getShoppingListState(), selectedRecipeIds: ids } });
}

export function saveCheckedKeys(keys) {
  patchUserDoc({ shoppingList: { ...getShoppingListState(), checkedKeys: keys } });
}
