import { EventEmitter } from 'events';
import md5 from 'md5';

class InsertObjectURL extends EventEmitter {
  // Constructor
  constructor() {
    super();
    this.hashes = {};
    this.urls = {};
    this.timeout = {};
  }

  async insert(file) {
    // Insert using Hash
    const hash = md5(await file.text());
    const timeoutData = {};
    if (typeof hash === 'string') {
      // Blob Url
      const tinyUrl = URL.createObjectURL(file);
      this.hashes[hash] = tinyUrl;

      // Hash
      this.urls[tinyUrl] = hash;

      // Timeout
      this.timeout[hash] = timeoutData;

      // Complete
      this.emit('urlAdded', { id: hash, file: tinyUrl });
      return tinyUrl;
    }

    // Nothing
    const tinyUrl = URL.createObjectURL(file);
    this.emit('urlAdded', { id: null, file: tinyUrl });
    return tinyUrl;
  }

  delete(url, where) {
    // Look for URL
    if (!where) {
      const hash = this.urls[url];
      const tinyUrl = this.hashes[hash];
      if (hash && tinyUrl) {
        this.emit('urlDeleted', {
          id: tinyUrl,
          url: tinyUrl,
        });
        URL.revokeObjectURL(tinyUrl);
        delete this.hashes[hash];
        delete this.timeout[hash];
        delete this.urls[url];
        return;
      }
    }

    // Look for Hash
    else if (this.hashes[where]) {
      this.emit('urlDeleted', { id: where, url: where });
      URL.revokeObjectURL(this.hashes[where]);
      delete this.timeout[where];
      delete this.hashes[where];
      return;
    }

    // Default
    this.emit('urlDeleted', { id: null, url: where });
    URL.revokeObjectURL(url);
  }
}

// Module
const insertObjectURL = new InsertObjectURL();
export default insertObjectURL;

if (__ENV_APP__.MODE === 'development') {
  global.insertObjectURL = insertObjectURL;
}

setInterval(() => {}, 1000);
