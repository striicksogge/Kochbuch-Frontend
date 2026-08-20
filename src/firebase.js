// Zentrale Firebase-Initialisierung. Einzelner Nutzer (kein öffentliches
// Registrierungsformular) - der Account wird einmalig manuell in der
// Firebase Console angelegt (Authentication -> Users -> Add user).
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Kein Firebase Storage (kostenpflichtiger Blaze-Tarif nötig, siehe
// data/recipeStorage.js) - nur Auth + Firestore.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
