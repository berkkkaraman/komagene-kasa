const CACHE_NAME = "gunkasa-v1";

const ASSETS_TO_CACHE = [
    "/",
    "/manifest.json",
    "/favicon.ico",
    "/icon.svg"
];

// Install Event: Cache core assets
self.addEventListener("install", (event: any) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("📦 Service Worker: Caching App Shell");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    (self as any).skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener("activate", (event: any) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
});

// Fetch Event: Network First, then Cache
self.addEventListener("fetch", (event: any) => {
    // Only handle HTTP/HTTPS protocols
    if (!event.request.url.startsWith("http")) return;

    // For API calls (Supabase), always go to network (or handle via IndexedDB separate logic)
    if (event.request.url.includes("supabase")) {
        return;
    }

    // For Static Assets (Next.js chunks, images), go Cache First
    if (event.request.url.includes("_next/static") || event.request.url.includes("icons/")) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request);
            })
        );
        return;
    }

    // For HTML pages, try Network first, fall back to offline page (if we had one)
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
