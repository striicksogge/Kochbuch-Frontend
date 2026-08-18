import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { sendFeedback } from "../data/feedbackApi";

const CATEGORIES = [
  { value: "bug", label: "Fehler / Bug" },
  { value: "idea", label: "Idee / Wunsch" },
  { value: "other", label: "Sonstiges" },
];

/**
 * Feedback-Formular für Tester (siehe data/testerMode.js). Schickt direkt an
 * Formspree, kein eigenes Backend nötig. Nur über den Link im
 * TesterModeBanner erreichbar, nicht in der Bottom-Nav.
 */
export default function FeedbackPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) {
      setError("Bitte kurz beschreiben, worum es geht.");
      return;
    }
    setError("");
    setIsSending(true);
    try {
      await sendFeedback({ category, message });
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Senden fehlgeschlagen. Bitte gleich nochmal versuchen.");
    } finally {
      setIsSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-8 pb-24 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-olive/10 text-olive">
          <Check size={28} />
        </span>
        <h1 className="font-display text-lg font-semibold text-ink">Danke für dein Feedback!</h1>
        <p className="mt-2 text-sm text-ink-soft">Ist angekommen – hilft sehr weiter.</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-5 rounded-[var(--radius-chip)] bg-olive px-6 py-3 text-sm font-semibold text-cream"
        >
          Zurück zur Startseite
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Zurück"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-xl font-semibold text-ink">Feedback geben</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 px-4">
        <p className="text-sm text-ink-soft">
          Ist dir ein Fehler aufgefallen oder hast du eine Idee? Kurz beschreiben reicht –
          Seite und Gerät werden automatisch mitgeschickt.
        </p>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Worum geht's?</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Nachricht</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="z. B. „Beim Import von einem TikTok-Link ist die Kochzeit leer geblieben.“"
            className="form-input"
            autoFocus
          />
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={isSending}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-olive py-3 text-sm font-semibold text-cream disabled:opacity-70"
        >
          {isSending ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Wird gesendet …
            </>
          ) : (
            "Absenden"
          )}
        </button>
      </form>
    </div>
  );
}
