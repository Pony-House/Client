import { EventEmitter } from 'events';
import md5 from 'md5';

class BlobUrlManager extends EventEmitter {
  // Constructor
  constructor() {
    super();
    this.hashes = {};
    this.urls = {};
    this.timeout = {};
    this.groups = {};
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
    if (typeof hash === 'string') {
      // Validator to new one
      if (!this.hashes[hash]) {
        // Timeout data
        const timeoutData = {
          value: 60,
          freeze: typeof ops.freeze === 'boolean' ? ops.freeze : false,
          groups: [],
        };

        // Create Group
        if (typeof ops.group === 'string') {
          if (!Array.isArray(this.groups[ops.group])) this.groups[ops.group] = [];
          this.groups[ops.group].push(hash);
          timeoutData.groups.push(ops.group);
        }

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

      // Add group
      if (typeof ops.group === 'string') {
        if (!Array.isArray(this.groups[ops.group])) this.groups[ops.group] = [];
        if (this.groups[ops.group].indexOf(hash) < 0) this.groups[ops.group].push(hash);

        if (this.timeout[hash].groups.indexOf(ops.group) < 0)
          this.timeout[hash].groups.push(ops.group);
      }

      return this.hashes[hash];
    }
  }

  delete(url, groupId) {
    // Look for URL
    console.log('delete', url);
    const hash = this.urls[url];
    const tinyUrl = this.hashes[hash];
    const timeoutData = this.timeout[hash];
    if (hash && tinyUrl && timeoutData) {
      // Allowed to delete
      let allowedToDelete = false;

      // No group
      if (typeof groupId !== 'string') {
        allowedToDelete = true;
      } else {
        // Delete group data
        const index = timeoutData.groups.indexOf(groupId);
        if (index > -1) {
          const index2 = this.groups[groupId].indexOf(hash);
          if (index2 > -1) {
            this.groups[groupId].splice(index2, 1);
            timeoutData.groups.splice(index, 1);
          }
        }

        // Check group data amount
        if (this.groups[groupId].length < 1) delete this.groups[groupId];
        if (timeoutData.groups.length < 1) allowedToDelete = true;
      }

      // Delete now
      if (allowedToDelete) {
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
}

// Module
const blobUrlManager = new BlobUrlManager();
export default blobUrlManager;

if (__ENV_APP__.MODE === 'development') {
  global.blobUrlManager = blobUrlManager;
}

setInterval(() => {
  blobUrlManager.checkAll();
}, 1000);
