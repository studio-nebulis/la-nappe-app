// Cache de l'appli (même principe que les autres applis du studio) : elle s'ouvre sans réseau.
// Page d'accueil : réseau d'abord ; le reste : cache d'abord, mise à jour en arrière-plan.
// Le fond de carte, la recherche et les stations viennent d'autres sites : ils ne sont pas mis en cache.
// CACHE est remplacé à chaque compilation (vite.config.js).
const CACHE = 'lanappe-20261126T2118';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const reseau = fetch(req).then(async (res) => {
    if (res.ok) await (await caches.open(CACHE)).put(req, res.clone());
    return res;
  });
  e.waitUntil(reseau.catch(() => {}));
  e.respondWith((async () => {
    const cached = await caches.match(req, { cacheName: CACHE });
    if (req.mode === 'navigate') return reseau.catch(() => cached || Response.error());
    return cached || reseau.catch(() => Response.error());
  })());
});
