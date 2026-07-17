import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// HashRouter statt BrowserRouter: GitHub Pages kann nur echte Dateien
// ausliefern, keine "virtuellen" React-Routen. Mit HashRouter fragt
// der Browser bei jedem Laden/Neuladen immer nur nach index.html,
// alles nach dem "#" (z. B. #/recipe/123) regelt React selbst im
// Browser - kein Server-seitiges Routing-Verständnis nötig.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)

// Service Worker registrieren (Offline-Fähigkeit + Voraussetzung für
// eine "echte" PWA-Installation statt nur eines Browser-Shortcuts).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((err) => {
      console.warn("Service Worker konnte nicht registriert werden:", err);
    });
  });
}

