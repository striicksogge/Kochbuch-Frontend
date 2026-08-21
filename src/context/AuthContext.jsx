import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

/**
 * Zwei Wege, einen Nutzer zu bekommen:
 *  1) E-Mail/Passwort - der eine persönliche Account des Nutzers, kein
 *     öffentliches Registrierungsformular, wird einmalig manuell in der
 *     Firebase Console angelegt (Authentication -> Users -> Add user).
 *  2) Anonym (signInAnonymously) - für Tester (siehe App.jsx: ?tester=1
 *     in der URL löst das automatisch aus, kein Passwort nötig). Jeder
 *     anonyme Account bekommt eine eigene, isolierte uid und damit
 *     eigene, private Rezepte in Firestore (firestore.rules greift
 *     identisch für anonyme wie für "echte" Accounts) - entspricht dem
 *     früheren Verhalten mit localStorage (jedes Gerät/jeder Browser
 *     startet unabhängig). Muss einmalig in der Firebase Console
 *     aktiviert werden: Authentication -> Sign-in method -> Anonymous.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function loginAnonymously() {
    await signInAnonymously(auth);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, login, loginAnonymously, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() muss innerhalb von <AuthProvider> aufgerufen werden.");
  }
  return ctx;
}
