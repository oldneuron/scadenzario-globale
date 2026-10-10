// Service worker: avvio istantaneo anche offline, senza restare bloccati su versioni vecchie.
const CACHE = 'scadenzario-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png',
  '/apple-touch-icon.png', '/icon.svg', '/qrcode.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  // Dati e funzioni: sempre dalla rete (l'app tiene comunque una copia locale).
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/.netlify/')) return;
  if (r.mode === 'navigate') {
    // Pagina: prima la rete (versione sempre aggiornata); se è lenta o offline usa la copia salvata.
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await Promise.race([fetch(r), new Promise((_, rej) => setTimeout(rej, 2500))]);
        if (res && res.ok) cache.put('/index.html', res.clone());
        return res;
      } catch (_) {
        return (await cache.match('/index.html')) || (await cache.match('/')) || Response.error();
      }
    })());
    return;
  }
  // Icone e script: dalla copia salvata, aggiornata in background.
  e.respondWith(caches.match(r).then((hit) => {
    const net = fetch(r).then((res) => { if (res && res.ok) caches.open(CACHE).then((c) => c.put(r, res.clone())); return res; }).catch(() => hit);
    return hit || net;
  }));
});
