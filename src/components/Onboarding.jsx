import { Link2, Sparkles, CalendarDays, Heart } from "lucide-react";
import { markWhatsNewSeen } from "../data/whatsNew";

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
 * danach nie wieder. Der Nutzer entscheidet sich zwischen einer
 * geführten App-Tour (siehe AppTour.jsx) und eigenständigem Erkunden.
 */
export default function Onboarding({ onFinish }) {
  function handleStart(withTour) {
    localStorage.setItem(STORAGE_KEY, "true");
    markWhatsNewSeen(); // Onboarding stellt die aktuellen Funktionen schon vor
    onFinish(withTour);
  }

  return (
    // Bewusst durchgängig helle Markenfarben statt der Theme-Tokens
    // (text-ink, bg-olive, ...), unabhängig vom Dark-Mode-Theme (siehe
    // data/theme.js): logo.png ist eine statische Grafik mit fest
    // dunklen Farben, entworfen für einen hellen Hintergrund. Nur den
    // Hintergrund zu erzwingen hätte im Dark Mode hellen (Theme-)Text
    // auf jetzt hellem Hintergrund ergeben - quasi unsichtbar.
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#FAF6EE] px-6 pb-8 pt-14">
      <div className="flex-1">
        <img src="./logo.png" alt="REZIPI" className="mx-auto w-28" />
        <p className="mt-4 font-display text-2xl font-semibold text-[#2B2A22]">Willkommen bei REZIPI</p>
        <p className="mt-2 text-sm leading-relaxed text-[#6B6A5E]">
          Dein persönliches Kochbuch für Rezepte, die du sonst nur einmal siehst und nie
          wiederfindest.
        </p>

        <div className="mt-8 space-y-6">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5F6B45]/10 text-[#5F6B45]">
                <Icon size={18} />
              </span>
              <div>
                <p className="font-display text-base font-medium text-[#2B2A22]">{title}</p>
                <p className="mt-0.5 text-sm text-[#6B6A5E]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={() => handleStart(true)}
          className="w-full rounded-[var(--radius-chip)] bg-[#5F6B45] py-3 text-sm font-semibold text-[#FAF6EE]"
        >
          App-Tour starten
        </button>
        <button
          type="button"
          onClick={() => handleStart(false)}
          className="w-full rounded-[var(--radius-chip)] border border-[#E6DCC6] py-3 text-sm font-semibold text-[#2B2A22]"
        >
          Selbst erkunden
        </button>
      </div>
    </div>
  );
}
