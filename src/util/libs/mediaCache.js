const urlCache = {};
const checkUrlCache = (url) => {
  if (typeof global.cacheFileElectron === 'function') {
    if (urlCache[url]) return urlCache[url];
    const validate = global.cacheFileElectron(url);
    if (validate.complete) urlCache[url] = validate.value;
    return validate.value;
  }
  return url;
};

// WIP FILE
export function readImageUrl(url) {
  if (!__ENV_APP__.ELECTRON_MODE) return url;
  return checkUrlCache(url);
}

export function readVideoUrl(url) {
  if (!__ENV_APP__.ELECTRON_MODE) return url;
  return checkUrlCache(url);
}

export function readAudioUrl(url) {
  if (!__ENV_APP__.ELECTRON_MODE) return url;
  return checkUrlCache(url);
}
