import EventEmitter from 'events';
import * as linkify from 'linkifyjs';

import { eventMaxListeners } from '../matrixUtil';

// Emitter
class LibreTranslate extends EventEmitter {
  constructor() {
    super();
    this.Initialized = false;
  }

  start() {
    if (!this.Initialized) {
      this.Initialized = true;

      // Get Content
      this.content = global.localStorage.getItem('ponyHouse-libre-translate');

      try {
        this.content = JSON.parse(this.content) ?? {};
      } catch (err) {
        this.content = {};
      }

      // Data
      this.content.enabled =
        typeof this.content.enabled === 'boolean'
          ? this.content.enabled
          : !!__ENV_APP__.LIBRE_TRANSLATE.ENABLED;

      this.content.defaultHost =
        typeof this.content.defaultHost === 'string' &&
        this.content.defaultHost.length > 0 &&
        linkify.test(this.content.defaultHost)
          ? this.content.defaultHost
          : !!__ENV_APP__.LIBRE_TRANSLATE.DEFAULT_HOST;
    }
  }

  get(folder) {
    this.start();
    if (typeof folder === 'string' && folder.length > 0) {
      if (typeof this.content[folder] !== 'undefined') return this.content[folder];
      return null;
    }

    return this.content;
  }

  set(folder, value) {
    this.start();
    if (typeof folder === 'string') {
      this.content[folder] = value;
      global.localStorage.setItem('ponyHouse-appearance', JSON.stringify(this.content));
      this.emit(folder, value);
    }
  }
}

// Functions and class
const libreTranslate = new LibreTranslate();
libreTranslate.setMaxListeners(eventMaxListeners);
export default libreTranslate;

if (__ENV_APP__.MODE === 'development') {
  global.libreTranslate = libreTranslate;
}
