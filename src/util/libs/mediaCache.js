const urlCache = {};
const checkUrlCache = (url, type = '') => {
  if (typeof global.cacheFileElectron === 'function') {
    if (urlCache[url]) return urlCache[url];
    const validate = global.cacheFileElectron(url, type);
    if (validate.complete) urlCache[url] = validate.value;
    return validate.value;
  }
  return url;
};

// Image
export function readImageUrl(url) {
  if (!__ENV_APP__.ELECTRON_MODE) return url;
  return checkUrlCache(url, 'img');
}

// Video
export function readVideoUrl(url) {
  if (!__ENV_APP__.ELECTRON_MODE) return url;
  return checkUrlCache(url, 'video');
}

// Audio
export function readAudioUrl(url) {
  if (!__ENV_APP__.ELECTRON_MODE) return url;
  return checkUrlCache(url, 'audio');
}
