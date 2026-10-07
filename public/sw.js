self.addEventListener('install', (event) => {
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Tell the active service worker to take control of the page immediately.
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // This is a minimal fetch handler required to trigger the "Add to Home Screen" prompt.
    // In a production app, we would implement offline caching here (e.g., using Workbox).
});
