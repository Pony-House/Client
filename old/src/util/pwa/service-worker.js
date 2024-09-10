/**
 * Proxy request using cache-first strategy
 *
 * @param {Cache} caches
 * @param {Request} request
 * @returns {Promise}
 */
function proxyRequest(caches, request) {
    var key = buildKey(request.url);
    // set namespace
    return caches.open(key).then(function (cache) {
        // check cache
        return cache.match(request).then(function (cachedResponse) {

            const reject = (err) => {
                console.error(err);
                console.error('[PWA] [service-worker] Failed to fetch', request.url);
                // Placeholder image for the fallback
                return fetch('./img/svg/image-broken.svg', { mode: 'no-cors' });
                return err;
            };

            if (typeof nodeFetch === 'function') return nodeFetch(request.clone()).then(resolve).catch(reject);
            return fetch(request.clone()).then(resolve).catch(reject);
        });
    });
}

self.addEventListener('fetch', function (event) {
    var request = event.request;
    console.log('[PWA] [service-worker] Detected request', request.url);
});

// Obtain an array of Window client objects
/* self.clients.matchAll(options).then(function (clients) {
    if (clients && clients.length) {
      //Respond to last focused tab
      clients[0].postMessage({type: 'MSG_ID'});
    }
  }); */