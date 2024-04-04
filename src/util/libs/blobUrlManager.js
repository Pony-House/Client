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

  checkBlob(hash) {
    if (!this.timeout[hash].freeze) {
      if (this.timeout[hash].value > 0) this.timeout[hash].value--;
      else {
        return this.delete(this.hashes[hash]);
      }
    }

    return false;
  }

  checkAllBlobs() {
    let checked = false;
    for (const hash in this.timeout) {
      const tinyCheck = this.checkBlob(hash);
      if (tinyCheck) checked = true;
    }
    return checked;
  }

  async insert(file, ops = {}) {
    // Insert using Hash
    const hash = md5(await file.text());
    if (typeof hash === 'string') {
      // Validator to new one
      if (typeof this.hashes[hash] !== 'string') {
        // Timeout data
        const timeoutData = {
          value: 60,
          freeze: typeof ops.freeze === 'boolean' ? ops.freeze : false,
          groups: [],
        };

        // Create Group
        let groupId = null;
        if (typeof ops.group === 'string') {
          groupId = ops.group;
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
        this.emit('urlAdded', { id: hash, file: tinyUrl, groupId });
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
    // Allowed to delete
    let allowedToDelete = false;

    // Look for URL
    console.log('delete', url);
    const hash = this.urls[url];
    const tinyUrl = this.hashes[hash];
    const timeoutData = this.timeout[hash];
    if (typeof hash === 'string' && typeof tinyUrl === 'string' && timeoutData) {
      // No group
      if (typeof groupId !== 'string') {
        allowedToDelete = true;
      } else if (Array.isArray(this.groups[groupId])) {
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
          groupId: typeof groupId === 'string' ? groupId : null,
        });
        URL.revokeObjectURL(tinyUrl);
        delete this.hashes[hash];
        delete this.timeout[hash];
        delete this.urls[tinyUrl];
      }
    }
    return allowedToDelete;
  }

  deleteGroup(groupId) {
    if (Array.isArray(this.groups[groupId])) {
      for (const item in this.groups[groupId]) {
        const hash = this.groups[groupId][item];
        if (typeof hash === 'string') {
          const tinyUrl = this.hashes[hash];
          if (typeof tinyUrl === 'string') {
            this.delete(tinyUrl, groupId);
          }
        }
      }
      return true;
    }
    return false;
  }
}

// Module
const blobUrlManager = new BlobUrlManager();
export default blobUrlManager;

if (__ENV_APP__.MODE === 'development') {
  global.blobUrlManager = blobUrlManager;
}

setInterval(() => {
  blobUrlManager.checkAllBlobs();
}, 1000);
