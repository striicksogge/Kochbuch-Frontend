/* ===================================================================
   Service Worker – Kochbuch v2
   -------------------------------------------------------------------
   Anders als beim ersten, einfachen Prototyp gibt es hier KEINE feste
   Liste von zu cachenden Dateien: Vite erzeugt bei jedem Build neue,
   gehashte Dateinamen (z. B. index-B8EPpK7e.js), eine feste Liste
   wäre nach dem nächsten Build sofort veraltet.

   Stattdessen: Laufzeit-Caching (Cache wird beim ersten Aufruf jeder
   Datei automatisch befüllt). Navigationen (HTML) laufen "Network
   First" (immer die aktuellste Version versuchen, Cache nur als
   Offline-Fallback). Alles andere (JS/CSS/Bilder) läuft "Cache First"
   (schnell, da diese Dateien wegen der Hash-Namen ohnehin nie ihren
   Inhalt unter gleichem Namen ändern).
   =================================================================== */

const CACHE_NAME = "kochbuch-v2-runtime-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // externe Ressourcen (Google Fonts etc.) unangetastet lassen

  // Navigationen (HTML-Aufrufe): Network First, Cache als Offline-Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./")))
    );
    return;
  }

  // Alles andere (JS/CSS/Bilder): Cache First, Netzwerk als Fallback + Cache auffüllen
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
