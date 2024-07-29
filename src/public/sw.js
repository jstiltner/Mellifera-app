// src/serviceWorker.js
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('my-cache').then(function(cache) {
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
      event.waitUntil(syncData());
    }
  });
  
  async function syncData() {
    // Fetch data from IndexedDB/localforage and send it to your server
    const data = await localforage.getItem('offlineData');
    if (data) {
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
