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

  checkAll() {
    for (const hash in this.timeout) {
      if (!this.timeout[hash].freeze) {
        if (this.timeout[hash].value > 0) this.timeout[hash].value--;
        else {
          this.delete(this.hashes[hash]);
        }
      }
    }
  }

  async insert(file, ops = {}) {
    // Insert using Hash
    const hash = md5(await file.text());
    const timeoutData = { value: 60, freeze: typeof ops.freeze === 'boolean' ? ops.freeze : false };
    if (typeof hash === 'string') {
      // Validator to new one
      if (!this.hashes[hash]) {
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
      return this.hashes[hash];
    }
  }

  delete(url) {
    // Look for URL
    console.log('delete', url);
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
      delete this.urls[tinyUrl];
    }
  }
}

// Module
const insertObjectURL = new InsertObjectURL();
export default insertObjectURL;

if (__ENV_APP__.MODE === 'development') {
  global.insertObjectURL = insertObjectURL;
}

setInterval(() => {
  insertObjectURL.checkAll();
}, 1000);
