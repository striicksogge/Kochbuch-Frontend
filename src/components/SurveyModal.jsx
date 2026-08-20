import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { sendSurveyResponse } from "../data/feedbackApi";
import { markSurveyShown, SURVEY_IDS } from "../data/surveys";

/**
 * Zwei mehrstufige In-App-Umfragen für Tester, ausgelöst über
 * data/surveys.js (siehe testerMode.js für die Trigger-Punkte).
 * Jede Antwort führt sofort zur nächsten passenden Frage weiter
 * (kein extra "Weiter"-Klick bei Auswahlfragen), nur bei Freitext
 * gibt es einen Button zum Bestätigen. "Später" ist auf jedem
 * Schritt möglich und markiert die Umfrage endgültig als erledigt
 * (wird danach nie wieder gezeigt), genau wie ein abgeschlossenes
 * Absenden.
 */
export default function SurveyModal({ surveyId, onClose }) {
  const [sent, setSent] = useState(false);

  function handleComplete() {
    markSurveyShown(surveyId);
    setSent(true);
  }

  function handleDismiss() {
    markSurveyShown(surveyId);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-24 sm:items-center sm:pb-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-cream-card p-4 shadow-lg">
        {sent ? (
          <ThankYou onClose={onClose} />
        ) : surveyId === SURVEY_IDS.FIRST_IMPORT ? (
          <FirstImportFlow onComplete={handleComplete} onDismiss={handleDismiss} />
        ) : (
          <TestPhaseFlow onComplete={handleComplete} onDismiss={handleDismiss} />
        )}
      </div>
    </div>
  );
}

function ThankYou({ onClose }) {
  return (
    <div className="text-center">
      <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-olive/10 text-olive">
        <Check size={20} />
      </span>
      <p className="font-display text-base font-medium text-ink">
        Vielen Dank für dein Feedback und die Testnutzung von REZIPI!
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-[var(--radius-chip)] bg-olive py-2.5 text-sm font-semibold text-cream"
      >
        Schließen
      </button>
    </div>
  );
}

function ScaleQuestion({ question, lowLabel, highLabel, onSelect, disabled }) {
  return (
    <div>
      <p className="font-display text-base font-medium text-ink">{question}</p>
      <div className="mt-4 flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(n)}
            aria-label={String(n)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-sand-line bg-cream text-sm font-semibold text-ink disabled:opacity-60"
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-ink-soft">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function ChoiceQuestion({ question, options, onSelect, disabled }) {
  return (
    <div>
      <p className="font-display text-base font-medium text-ink">{question}</p>
      <div className="mt-3 space-y-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt)}
            className="w-full rounded-[var(--radius-chip)] border border-sand-line bg-cream-card py-2.5 text-sm font-medium text-ink disabled:opacity-60"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextQuestion({ question, value, onChange, onSubmit, submitLabel, isSending }) {
  return (
    <div>
      <p className="font-display text-base font-medium text-ink">{question}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Optional"
        className="form-input mt-3"
        autoFocus
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSending}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-chip)] bg-olive py-2.5 text-sm font-semibold text-cream disabled:opacity-70"
      >
        {isSending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Wird gesendet …
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}

function SkipLink({ onDismiss }) {
  return (
    <button type="button" onClick={onDismiss} className="mt-3 w-full py-1 text-center text-xs text-ink-soft">
      Später
    </button>
  );
}

/**
 * Frage 1: Skala 1 (sehr schwer) - 5 (sehr einfach). Bei 1-3 zusätzlich
 * ein Freitextfeld "Was können wir verbessern?", danach Ende. Bei 4-5
 * direkt Ende.
 */
function FirstImportFlow({ onComplete, onDismiss }) {
  const [step, setStep] = useState("rating");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(finalComment) {
    setIsSending(true);
    setError("");
    try {
      await sendSurveyResponse({
        surveyId: SURVEY_IDS.FIRST_IMPORT,
        answers: { rating, comment: finalComment },
      });
      onComplete();
    } catch (err) {
      console.error(err);
      setError("Senden fehlgeschlagen. Bitte gleich nochmal versuchen.");
    } finally {
      setIsSending(false);
    }
  }

  function handleRate(n) {
    setRating(n);
    if (n <= 3) {
      setStep("comment");
    } else {
      submit("");
    }
  }

  return (
    <div>
      {step === "rating" ? (
        <ScaleQuestion
          question="Wie einfach war es, das Rezept zu importieren?"
          lowLabel="sehr schwer"
          highLabel="sehr einfach"
          onSelect={handleRate}
          disabled={isSending}
        />
      ) : (
        <TextQuestion
          question="Was können wir verbessern?"
          value={comment}
          onChange={setComment}
          onSubmit={() => submit(comment)}
          submitLabel="Absenden"
          isSending={isSending}
        />
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <SkipLink onDismiss={onDismiss} />
    </div>
  );
}

/**
 * Frage 1: "Bist du zufrieden?" (Ja/Nein/Teils Teils) - bei Nein
 * Freitext, dann Ende. Bei Ja/Teils Teils weiter zu Frage 2.
 * Frage 2: "Würdest du weiter verwenden?" (Ja/Nein/Nur wenn...) - bei
 * Nein Ende, bei "Nur wenn..." Freitext und dann weiter zu Frage 3,
 * bei Ja direkt weiter zu Frage 3.
 * Frage 3 (nur erreichbar über Ja/Nur wenn): "Würdest du auch für
 * 4,99€ einmalig zahlen?" (Ja/Nein) - danach immer Ende.
 */
function TestPhaseFlow({ onComplete, onDismiss }) {
  const [step, setStep] = useState("satisfied");
  const [satisfied, setSatisfied] = useState("");
  const [unhappyComment, setUnhappyComment] = useState("");
  const [wouldContinue, setWouldContinue] = useState("");
  const [conditionComment, setConditionComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function finish(answers) {
    setIsSending(true);
    setError("");
    try {
      await sendSurveyResponse({ surveyId: SURVEY_IDS.TEST_PHASE, answers });
      onComplete();
    } catch (err) {
      console.error(err);
      setError("Senden fehlgeschlagen. Bitte gleich nochmal versuchen.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSatisfied(answer) {
    setSatisfied(answer);
    if (answer === "Nein") {
      setStep("unhappyComment");
    } else {
      setStep("continue");
    }
  }

  function handleContinue(answer) {
    setWouldContinue(answer);
    if (answer === "Nein") {
      finish({ satisfied, wouldContinue: answer, unhappyComment: "", conditionComment: "" });
    } else if (answer === "Nur wenn...") {
      setStep("conditionComment");
    } else {
      setStep("price");
    }
  }

  function handlePay(answer) {
    finish({
      satisfied,
      unhappyComment: "",
      wouldContinue,
      conditionComment,
      willingToPay: answer,
    });
  }

  return (
    <div>
      {step === "satisfied" && (
        <ChoiceQuestion
          question="Bist du zufrieden mit REZIPI?"
          options={["Ja", "Nein", "Teils Teils"]}
          onSelect={handleSatisfied}
          disabled={isSending}
        />
      )}
      {step === "unhappyComment" && (
        <TextQuestion
          question="Was können wir verbessern?"
          value={unhappyComment}
          onChange={setUnhappyComment}
          onSubmit={() =>
            finish({ satisfied, unhappyComment, wouldContinue: "", conditionComment: "" })
          }
          submitLabel="Absenden"
          isSending={isSending}
        />
      )}
      {step === "continue" && (
        <ChoiceQuestion
          question="Würdest du REZIPI weiter verwenden?"
          options={["Ja", "Nein", "Nur wenn..."]}
          onSelect={handleContinue}
          disabled={isSending}
        />
      )}
      {step === "conditionComment" && (
        <TextQuestion
          question="Was können wir verbessern?"
          value={conditionComment}
          onChange={setConditionComment}
          onSubmit={() => setStep("price")}
          submitLabel="Weiter"
          isSending={false}
        />
      )}
      {step === "price" && (
        <ChoiceQuestion
          question="Würdest du die App auch nutzen, wenn sie einmalig 4,99 € kostet?"
          options={["Ja", "Nein"]}
          onSelect={handlePay}
          disabled={isSending}
        />
      )}
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <SkipLink onDismiss={onDismiss} />
    </div>
  );
}
