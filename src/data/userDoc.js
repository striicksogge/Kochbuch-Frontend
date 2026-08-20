// Gemeinsamer In-Memory-Cache für die "kleinen" Nutzdaten (Essensplan,
// Einkaufsliste, eigene Kategorien) - im Gegensatz zu den Rezepten (die
// den eigentlichen Platzbedarf verursachen, siehe recipeStorage.js)
// klein genug, um als Felder eines einzigen Firestore-Dokuments zu leben
// (users/{uid}), statt einer eigenen Sub-Collection pro Datenart.
//
// Wird einmal beim Login geladen (initUserDoc) und danach synchron aus
// dem Cache gelesen - die bestehenden data/mealPlanStorage.js,
// shoppingListStorage.js und customCategories.js behalten dadurch genau
// dieselbe synchrone Aufruf-Signatur wie vorher (localStorage-Ära), nur
// die Speicherung dahinter ist jetzt Firestore. Schreiben aktualisiert
// den Cache sofort (Lesen danach ist konsistent) und schickt die
// Änderung im Hintergrund an Firestore (Fehler werden geloggt, nicht
// dem Nutzer gezeigt - das sind kleine Einstellungsdaten, kein Grund
// für eine Fehlermeldung wie beim vollen Rezept-Speicher).

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const DEFAULT_DATA = {
  mealPlan: {},
  shoppingList: { selectedRecipeIds: [], checkedKeys: [] },
  customCategories: [],
};

let uid = null;
let data = { ...DEFAULT_DATA };

export async function initUserDoc(userUid) {
  uid = userUid;
  const snap = await getDoc(doc(db, "users", uid));
  data = { ...DEFAULT_DATA, ...(snap.exists() ? snap.data() : {}) };
}

export function resetUserDoc() {
  uid = null;
  data = { ...DEFAULT_DATA };
}

export function getUserData() {
  return data;
}

export function patchUserDoc(partial) {
  data = { ...data, ...partial };
  if (!uid) return;
  setDoc(doc(db, "users", uid), partial, { merge: true }).catch((err) => {
    console.error("Konnte Einstellungen nicht in Firestore speichern:", err);
  });
}
