// Service Worker
const STATIC_CACHE = 'app-static-v1';
const RUNTIME_CACHE = 'app-runtime-v1';

// Files to pre-cache on install
const PRECACHE = [
  '/offline.html'
];

// Install: cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      // Try to cache files, but don't fail if some are missing
      return Promise.allSettled(
        PRECACHE.map(url => 
          cache.add(url).catch(err => {
            console.warn(`Failed to cache ${url}:`, err);
            return null;
          })
        )
      );
    }).catch(err => {
      console.warn('Service Worker install failed:', err);
      // Don't prevent SW from activating even if caching fails
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Helper to detect navigation requests
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

// Fetch: implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Navigations: Network-first, fall back to offline page
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }
  
  // Images: Cache-first
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(resp => {
          const copy = resp.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(request, copy));
          return resp;
        });
      })
    );
    return;
  }
  
  // Other GET requests: Network-first with cache fallback
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request).then(resp => {
        if (resp.status === 200) {
          const copy = resp.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(request, copy));
        }
        return resp;
      }).catch(() => caches.match(request))
    );
  }
});

// Listen for skip waiting message
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

