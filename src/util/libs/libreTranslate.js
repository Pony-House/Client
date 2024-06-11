import EventEmitter from 'events';
import * as linkify from 'linkifyjs';
import { objType } from 'for-promise/utils/lib.mjs';

import { eventMaxListeners } from '../matrixUtil';
import { fetchFn } from '@src/client/initMatrix';

// Emitter
class LibreTranslate extends EventEmitter {
  constructor() {
    super();
    this.Initialized = false;
  }

  _testUrl(value) {
    return (
      (!value.startsWith('https://') &&
        !value.startsWith('http://') &&
        linkify.test(`https://${value}`)) ||
      linkify.test(value)
    );
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

      this.defaultHost =
        typeof __ENV_APP__.LIBRE_TRANSLATE.DEFAULT_HOST === 'string' &&
        __ENV_APP__.LIBRE_TRANSLATE.DEFAULT_HOST.length > 0 &&
        this._testUrl(__ENV_APP__.LIBRE_TRANSLATE.DEFAULT_HOST)
          ? __ENV_APP__.LIBRE_TRANSLATE.DEFAULT_HOST
          : null;

      this.content.apiKey =
        typeof this.content.apiKey === 'string' && this.content.apiKey.length > 0
          ? this.content.apiKey
          : __ENV_APP__.LIBRE_TRANSLATE.API_KEY;

      this.content.host =
        typeof this.content.host === 'string' &&
        this.content.host.length > 0 &&
        this._testUrl(this.content.host)
          ? this.content.host
          : this.defaultHost;

      this.content.source =
        typeof this.content.source === 'string' && this.content.source.length > 0
          ? this.content.source
          : 'auto';

      this.content.target =
        typeof this.content.target === 'string' && this.content.target.length > 0
          ? this.content.target
          : 'en';
    }
  }

  async translate(text, coptions = {}, isDebug = false) {
    if (isDebug) console.log('[LibreTranslate] [settings]', this.content);
    if (
      typeof text === 'string' &&
      this.content &&
      typeof this.content.host === 'string' &&
      this.content.host.length > 0 &&
      this._testUrl(this.content.host)
    ) {
      const body = {
        q: text,
        source: this.content.source,
        target: this.content.target,
        api_key: this.content.apiKey,
        format: 'text',
      };

      if (typeof coptions.source === 'string') options.source = coptions.source;

      if (typeof coptions.target === 'string') options.target = coptions.target;

      if (typeof coptions.apiKey === 'string') options.apiKey = coptions.apiKey;

      const options = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      };

      if (isDebug) console.log('[LibreTranslate] [body]', body);
      if (isDebug) console.log('[LibreTranslate] [options]', options);

      const res = await fetchFn(
        `${this.content.host.startsWith('https://') || this.content.host.startsWith('http://') ? this.content.host : `https://${this.content.host}`}${!this.content.host.endsWith('/') ? '/' : ''}translate`,
        options,
      );

      try {
        const result = await res.json();
        if (isDebug) console.log('[LibreTranslate] [result]', result);
        if (!result.error) {
          if (objType(result, 'object') && typeof result.translatedText === 'string')
            return result.translatedText;
        } else {
          console.error(result.error);
          if (typeof result.error === 'string') alert(result.error, 'Libre Translate Error');
        }
      } catch (err) {
        console.error(err);
        alert(err.message, 'Libre Translate Error');
        return null;
      }
    }
    return null;
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
      global.localStorage.setItem('ponyHouse-libre-translate', JSON.stringify(this.content));
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
