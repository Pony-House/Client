import { objType } from 'for-promise/utils/lib.mjs';
import EventEmitter from 'events';

import { eventMaxListeners } from '../matrixUtil';

// Emitter
class TinyLocale extends EventEmitter {
  constructor() {
    super();
    this.defaultLocale = 'en';
    this.locale = this.defaultLocale;
    this.locales = ['en'];
  }

  getDefaultLocale() {
    return this.defaultLocale;
  }

  getLocale() {
    return this.locale;
  }

  setLocale(value) {
    if (this.locales.indexOf(value)) {
      this.locale = value;
      this.emit('localeChanged', value);
      return true;
    }
    return false;
  }

  appLocale() {
    if (navigator && navigator.language === 'string' && navigator.language.length > 0)
      return navigator.language;
    else return this.defaultLocale;
  }
}

// Functions and class
const i18 = new TinyLocale();
i18.setMaxListeners(eventMaxListeners);
export default i18;

if (__ENV_APP__.MODE === 'development') {
  global.i18 = i18;
}
