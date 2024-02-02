const mimeTypeCache = {};
setInterval(() => {
  for (const item in mimeTypeCache) {
    if (
      mimeTypeCache[item].error ||
      typeof mimeTypeCache[item].timeout !== 'number' ||
      Number.isNaN(mimeTypeCache[item].timeout) ||
      !Number.isFinite(mimeTypeCache[item].timeout) ||
      mimeTypeCache[item].timeout < 1
    ) {
      delete mimeTypeCache[item];
    } else {
      mimeTypeCache[item].timeout--;
    }
  }
}, 60000);

export function getFileContentType(e, where) {
  return new Promise((resolve, reject) => {
    if (!mimeTypeCache[where]) {
      mimeTypeCache[where] = { loaded: false, error: false, timeout: 60 };

      mimeTypeCache[where].width = e.target.width;
      mimeTypeCache[where].height = e.target.height;

      fetch(where, { method: 'HEAD' })
        .then((response) => {
          mimeTypeCache[where].loaded = true;
          mimeTypeCache[where].type = response.headers.get('Content-type');

          if (typeof mimeTypeCache[where].type === 'string') {
            mimeTypeCache[where].type = mimeTypeCache[where].type.split('/');
          } else {
            mimeTypeCache[where].type = null;
          }

          resolve(mimeTypeCache[where]);
        })
        .catch((err) => {
          mimeTypeCache[where].error = true;
          reject(err);
        });
    } else {
      if (!mimeTypeCache[where].loaded) {
        setTimeout(() => {
          getFileContentType(e, where).then(resolve).catch(reject);
        }, 100);
        return;
      }

      resolve(mimeTypeCache[where]);
    }
  });
}
