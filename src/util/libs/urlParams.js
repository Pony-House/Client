// Module
import EventEmitter from 'events';

// Events
(function (history) {
  // Push State
  const pushState = history.pushState;
  history.pushState = function (state, title, url) {
    if (typeof history.onpushstate === 'function') {
      history.onpushstate({ state, title, url });
    }

    // Call your custom function here
    return pushState.apply(history, arguments);
  };

  // Replace State
  const replaceState = history.pushState;
  history.replaceState = function (state, title, url) {
    if (typeof history.onreplacestate === 'function') {
      history.onpushstate({ state, title, url });
    }

    // Call your custom function here
    return replaceState.apply(history, arguments);
  };
})(window.history);

// Emitter
class MatrixUrlParams extends EventEmitter {
  // Constructor
  constructor() {
    // Data prepare
    super();
    const tinyThis = this;
    this.params = new URLSearchParams(window.location.search);

    // Event Change
    window.addEventListener('popstate', () => {
      tinyThis.params = new URLSearchParams(window.location.search);
      tinyThis.emit('popstate', tinyThis.params.toString());
    });
  }

  // Get values
  entries() {
    return this.params.entries();
  }

  keys() {
    return this.params.keys();
  }

  sort() {
    return this.params.sort();
  }

  values() {
    return this.params.values();
  }

  toString() {
    return this.params.toString();
  }

  get(name) {
    return this.params.get(name);
  }

  getAll(name) {
    return this.params.getAll(name);
  }

  has(name, value) {
    if (typeof value !== 'undefined') return this.params.has(name, value);
    return this.params.has(name);
  }

  forEach(callback, thisArg) {
    if (typeof thisArg !== 'undefined') return this.params.forEach(callback, thisArg);
    return this.params.forEach(callback);
  }

  // Manager
  _getPath() {
    const newSearch = this.params.toString();
    return `${window.location.pathname}${typeof newSearch === 'string' && newSearch.length > 0 ? `?${newSearch}` : ''}`;
  }

  _replaceState() {
    window.history.replaceState(null, document.title, this._getPath());
  }

  append(name, value) {
    this.params.append(name, value);
    this._replaceState();
    this.emit('append', String(name), String(value));
  }

  set(name, value) {
    this.params.set(name, value);
    this._replaceState();
    this.emit('set', String(name), String(value));
  }

  delete(name, value) {
    if (typeof value !== 'undefined') this.params.delete(name, value);
    this.params.delete(name);
    this._replaceState();
    this.emit('delete', String(name), String(value));
  }
}

// Functions and class
const urlParams = new MatrixUrlParams();
urlParams.setMaxListeners(Infinity);
export default urlParams;

if (__ENV_APP__.MODE === 'development') {
  global.urlParams = urlParams;
}
