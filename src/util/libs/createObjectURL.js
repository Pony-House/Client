import { EventEmitter } from 'events';

class InsertObjectURL extends EventEmitter {
  constructor() {
    super();
    this.urls = {};
  }

  insert(file, url) {
    if (typeof url === 'string') {
      this.urls[url] = URL.createObjectURL(file);
      this.emit('urlAdded', { id: url, file: this.urls[url] });
      return this.urls[url];
    }
    const newUrl = URL.createObjectURL(file);
    this.emit('urlAdded', { id: null, file: newUrl });
    return newUrl;
  }

  delete(url, where) {
    if (this.urls[where]) {
      this.emit('urlDeleted', { id: where, file: where });
      return URL.revokeObjectURL(this.urls[where]);
    }
    this.emit('urlDeleted', { id: null, file: where });
    return URL.revokeObjectURL(url);
  }
}

const insertObjectURL = new InsertObjectURL();
export default insertObjectURL;
