// Erkennt den einen persönlichen Account des Nutzers (nicht per
// "eingeloggt = echter Account", sondern fest auf diese eine E-Mail
// geprüft) - robuster gegen den Fall, dass irgendwann mal ein zweiter
// echter E-Mail/Passwort-Account für jemand anderen angelegt wird (der
// dann NICHT automatisch dieselben Admin-Rechte haben soll). Anonyme
// Tester-Logins (siehe AuthContext.jsx loginAnonymously) haben nie eine
// E-Mail und fallen dadurch ohnehin immer raus.
const ADMIN_EMAIL = "niclas.haufe02@web.de";

export function isAdmin(user) {
  return user?.email === ADMIN_EMAIL;
}
