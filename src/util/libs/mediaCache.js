const checkUrlCache = (url, type = '') => {
  if (typeof global.cacheFileElectron === 'function') {
    return global.cacheFileElectron(url, type);
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
