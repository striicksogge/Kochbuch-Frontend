import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Einfacher Login-Screen (E-Mail/Passwort). Kein Registrierungsformular -
 * der Account existiert schon (Firebase Console, manuell angelegt).
 */
export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
      setError("Anmeldung fehlgeschlagen – E-Mail oder Passwort falsch.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      <img src="./logo.png" alt="REZIPI" className="w-40" />
      <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xs space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-Mail"
          autoComplete="username"
          required
          className="form-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          autoComplete="current-password"
          required
          className="form-input"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-olive py-3 text-sm font-semibold text-cream disabled:opacity-70"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
