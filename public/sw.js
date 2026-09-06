const CACHE = 'erasmusbrug-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 页面导航：网络优先，离线时回退缓存
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const res = await fetch(request);
          if (res && res.ok) {
            cache.put(request, res.clone());
            return res;
          }
          throw new Error('network fail');
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          const home = await cache.match('/zh');
          if (home) return home;
          return Response.error();
        }
      })()
    );
    return;
  }

  // 静态资源与图片：缓存优先
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const res = await fetch(request);
        if (res && res.ok) cache.put(request, res.clone());
        return res;
      } catch {
        return cached || Response.error();
      }
    })()
  );
});
