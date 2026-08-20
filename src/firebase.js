// Zentrale Firebase-Initialisierung. Einzelner Nutzer (kein öffentliches
// Registrierungsformular) - der Account wird einmalig manuell in der
// Firebase Console angelegt (Authentication -> Users -> Add user).
//
// Die Config-Werte unten sind bewusst direkt im Code (nicht in .env/
// GitHub-Secrets) - der GitHub-Actions-Workflow (.github/workflows/deploy.yml)
// setzt keine Build-Umgebungsvariablen, ein reiner .env-Ansatz hätte den
// automatischen Deploy-Build kaputt gemacht. Das ist unproblematisch: Laut
// Firebase-Doku ist die Web-App-Config (apiKey etc.) NICHT geheim - sie
// identifiziert nur das Projekt, schützt aber nichts. Der eigentliche Schutz
// kommt von den Firestore-Sicherheitsregeln (firestore.rules: nur
// request.auth.uid == uid darf lesen/schreiben), nicht vom Verstecken dieser
// Werte. https://firebase.google.com/docs/projects/api-keys
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Kein Firebase Storage (kostenpflichtiger Blaze-Tarif nötig, siehe
// data/recipeStorage.js) - nur Auth + Firestore.
const firebaseConfig = {
  apiKey: "AIzaSyARSOCuwA7R22va1JQug6_0P7W94oUder4",
  authDomain: "rezepi.firebaseapp.com",
  projectId: "rezepi",
  messagingSenderId: "142218515435",
  appId: "1:142218515435:web:d1f78a25982b4f41347fae",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
