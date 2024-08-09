/**
 * Service worker interepts requests for images
 * It puts retrieved images in cache for 1 day
 * If image not found responds with fallback
 */

var INVALIDATION_INTERVAL = 24 * 60 * 60 * 1000; // 1 day
var NS = 'MAGE';
var SEPARATOR = '|';
var VERSION = Math.ceil(now() / INVALIDATION_INTERVAL);

/**
 * Helper to get current timestamp
 * @returns {Number}
 */
function now() {
  var d = new Date();
  return d.getTime();
}

/**
 * Build cache storage key that includes namespace, url and record version
 * @param {String} url
 * @returns {String}
 */
function buildKey(url) {
  return NS + SEPARATOR + url + SEPARATOR + VERSION;
}

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} RecordKey
 * @property {String} ns - namespace
 * @property {String} url - request identifier
 * @property {String} ver - record varsion
 */

/**
 * Parse cache key
 * @param {String} key
 * @returns {RecordKey}
 */
function parseKey(key) {
  var parts = key.split(SEPARATOR);
  return {
    ns: parts[0],
    key: parts[1],
    ver: parseInt(parts[2], 10),
  };
}

/**
 * Invalidate records matchinf actual version
 *
 * @param {Cache} caches
 * @returns {Promise}
 */
function purgeExpiredRecords(caches) {
  console.log('[PWA] [service-worker] Purging...');
  return caches.keys().then(function (keys) {
    return Promise.all(
      keys.map(function (key) {
        var record = parseKey(key);
        if (record.ns === NS && record.ver !== VERSION) {
          console.log('[PWA] [service-worker] deleting', key);
          return caches.delete(key);
        }
      }),
    );
  });
}

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
      if (cachedResponse) {
        console.info('[PWA] [service-worker] Take it from cache', request.url);
        return cachedResponse;
      }

      // { mode: "no-cors" } gives opaque response
      // https://fetch.spec.whatwg.org/#concept-filtered-response-opaque
      // so we cannot get info about response status
      const resolve = (networkResponse) => {
        if (networkResponse.type !== 'opaque' && networkResponse.ok === false) {
          throw new Error('Resource not available');
        }
        console.info(
          '[PWA] [service-worker] Fetch it through Network',
          request.url,
          networkResponse.type,
        );
        cache.put(request, networkResponse.clone());
        return networkResponse;
      };

      /* const reject = (err) => {
        console.error(err);
        console.error('[PWA] [service-worker] Failed to fetch', request.url);
        // Placeholder image for the fallback
        return fetch('./img/svg/image-broken.svg', { mode: 'no-cors' });
        return err;
      }; */

      if (typeof nodeFetch === 'function') return nodeFetch(request.clone()).then(resolve);
      return fetch(request.clone()).then(resolve);
    });
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(purgeExpiredRecords(caches));
});

self.addEventListener('fetch', function (event) {
  var request = event.request;

  // console.log('[PWA] [service-worker] Detected request', request.url);
  if (
    request.method !== 'GET' ||
    !request.url.match(/\.(jpe?g|png|gif|svg|webp|bmp|avif|jfif|pjpeg|pjp|ico|cur|tif|tiff)$/)
  ) {
    return;
  }

  // console.log('[PWA] [service-worker] Accepted request', request.url);
  event.respondWith(proxyRequest(caches, request));
});
