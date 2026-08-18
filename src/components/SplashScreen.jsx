import { useEffect, useState } from "react";

const SPLASH_DURATION_MS = 1600;
const FADE_DURATION_MS = 350;

/**
 * Marken-Screen bei JEDEM App-Start (nicht nur beim ersten Mal, dafür gibt
 * es Onboarding.jsx). Logo skaliert sanft hoch + blendet ein (siehe
 * .splash-logo/.splash-pulse in index.css), danach blendet der ganze
 * Screen wieder aus.
 */
export default function SplashScreen({ onFinish }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), SPLASH_DURATION_MS);
    const finishTimer = setTimeout(onFinish, SPLASH_DURATION_MS + FADE_DURATION_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-cream transition-opacity duration-300 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex items-center justify-center">
        <span className="splash-pulse absolute h-40 w-40 rounded-full bg-olive/20" />
        <img src="./logo.png" alt="RECIPI" className="splash-logo relative w-48" />
      </div>
    </div>
  );
}
