self.addEventListener('install', function(event) {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open('v1');
        await cache.addAll([
          '/index.html',
          '/style.css',
          '/firebase.js',
          '/router.js',
          '/store.js',
          '/indexedDB.js',
          '/listener-sw.js',
          '/src/pages/landing.js',
          '/src/pages/login.js',
          '/src/pages/event.js',
          '/src/pages/whoAreYou.js',
          '/src/pages/transaction.js',
        ]);
      } catch (error) {
        console.error('Failed to install the service worker:', error);
      }
    })()
  );
});


self.addEventListener('fetch', (event) => {
  console.log("Handling fetch event for", event.request.url);
  event.respondWith(
    fetch(event.request).catch(() => {
      console.log("Fetch failed; returning offline page instead.");
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        } else if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Not found in cache', { status: 404 });
      });
    })
  );
});
