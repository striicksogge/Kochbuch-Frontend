import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { applyTheme } from './data/theme.js'

// Vor dem ersten Render anwenden, damit die gespeicherte Darstellung
// (Hell/Dunkel/System, siehe data/theme.js) sofort greift statt erst
// nach einem kurzen Aufblitzen des Standard-Themes.
applyTheme()

// HashRouter statt BrowserRouter: GitHub Pages kann nur echte Dateien
// ausliefern, keine "virtuellen" React-Routen. Mit HashRouter fragt
// der Browser bei jedem Laden/Neuladen immer nur nach index.html,
// alles nach dem "#" (z. B. #/recipe/123) regelt React selbst im
// Browser - kein Server-seitiges Routing-Verständnis nötig.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
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

