import { useEffect, useState } from "react";

const SPLASH_DURATION_MS = 1100;
const FADE_DURATION_MS = 300;

/**
 * Kurzer Marken-Screen bei JEDEM App-Start (nicht nur beim ersten Mal,
 * dafür gibt es Onboarding.jsx). Blendet sich nach kurzer Zeit von
 * selbst wieder aus.
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
      <img src="./logo.png" alt="RECIPI" className="w-48" />
    </div>
  );
}
