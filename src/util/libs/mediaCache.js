const urlCache = {};
const checkUrlCache = (url) => {
  if (urlCache[url]) return urlCache[url];
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
