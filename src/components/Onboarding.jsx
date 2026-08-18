import { Link2, Sparkles, CalendarDays, Heart } from "lucide-react";

const STORAGE_KEY = "kochbuch_v2_onboarding_seen";

export function hasSeenOnboarding() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

const FEATURES = [
  {
    icon: Link2,
    title: "Rezepte per Link importieren",
    text: "TikTok, Instagram oder Pinterest – Titel, Zutaten und Zubereitung werden automatisch strukturiert.",
  },
  {
    icon: Sparkles,
    title: "Intelligent suchen",
    text: "Einfach in eigenen Worten beschreiben, z. B. „Schnell für heute“ oder „Irgendwas mit Hähnchen“.",
  },
  {
    icon: CalendarDays,
    title: "Essensplan & Einkaufsliste",
    text: "Woche verplanen und mit einem Tipp eine kombinierte Einkaufsliste erstellen.",
  },
  {
    icon: Heart,
    title: "Favoriten & Notizen",
    text: "Lieblingsrezepte markieren und Notizen fürs nächste Mal festhalten.",
  },
];

/**
 * Einmaliges Onboarding, nur beim allerersten Start (nach dem
 * Splash-Screen, siehe SplashScreen.jsx). Zeigt kurz die Kernfunktionen,
 * danach nie wieder.
 */
export default function Onboarding({ onFinish }) {
  function handleStart() {
    localStorage.setItem(STORAGE_KEY, "true");
    onFinish();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream px-6 pb-8 pt-14">
      <div className="flex-1">
        <p className="font-display text-2xl font-semibold text-ink">Willkommen bei Recipi</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Dein persönliches Kochbuch für Rezepte, die du sonst nur einmal siehst und nie
          wiederfindest.
        </p>

        <div className="mt-8 space-y-6">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
                <Icon size={18} />
              </span>
              <div>
                <p className="font-display text-base font-medium text-ink">{title}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleStart}
        className="mt-8 w-full rounded-[var(--radius-chip)] bg-olive py-3 text-sm font-semibold text-cream"
      >
        Los geht's
      </button>
    </div>
  );
}
