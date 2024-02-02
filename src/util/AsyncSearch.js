import EventEmitter from 'events';
import tinyAPI from './mods';

class AsyncSearch extends EventEmitter {
  // Constructor
  constructor() {
    super();

    this._reset();

    this.RESULT_SENT = 'RESULT_SENT';
  }

  // Reset Data
  _reset() {
    this.dataList = null;
    this.term = null;
    this.searchKeys = null;
    this.isContain = false;
    this.isCaseSensitive = false;
    this.normalizeUnicode = true;
    this.ignoreWhitespace = true;
    this.limit = null;
    this.findingList = [];

    this.searchUptoIndex = 0;
    this.sessionStartTimestamp = 0;
  }

  _softReset() {
    this.term = null;
    this.findingList = [];
    this.searchUptoIndex = 0;
    this.sessionStartTimestamp = 0;
  }

  /**
   * Setup the search.
   * opts.keys are required when dataList items are object.
   *
   * @param {[string | object]} dataList - A list to search in
   * @param {object} opts - Options
   * @param {string | [string]} [opts.keys=null]
   * @param {boolean} [opts.isContain=false] - Add finding to result if it contain search term
   * @param {boolean} [opts.isCaseSensitive=false]
   * @param {boolean} [opts.normalizeUnicode=true]
   * @param {boolean} [opts.ignoreWhitespace=true]
   * @param {number} [opts.limit=null] - Stop search after limit
   */
  setup(dataList, opts) {
    this._reset();
    this.dataList = dataList;
    this.searchKeys = opts?.keys || null;
    this.isContain = opts?.isContain || false;
    this.isCaseSensitive = opts?.isCaseSensitive || false;
    this.normalizeUnicode = opts?.normalizeUnicode || true;
    this.ignoreWhitespace = opts?.ignoreWhitespace || true;
    this.limit = opts?.limit || null;
  }

  // Search Function
  search(term) {
    this._softReset();

    this.term = this._normalize(term);
    if (this.term === '') {
      this._sendFindings();
      return;
    }

    this._find(this.sessionStartTimestamp, 0);
  }

  // Start Find Values
  _find(sessionTimestamp, lastFindingCount) {
    if (sessionTimestamp !== this.sessionStartTimestamp) return;
    this.sessionStartTimestamp = window.performance.now();

    // Search Index
    for (
      let searchIndex = this.searchUptoIndex;
      searchIndex < this.dataList.length;
      searchIndex += 1
    ) {
      if (this._match(this.dataList[searchIndex])) {
        this.findingList.push(this.dataList[searchIndex]);
        if (typeof this.limit === 'number' && this.findingList.length >= this.limit) break;
      }

      const calcFinishTime = window.performance.now();
      if (calcFinishTime - this.sessionStartTimestamp > 8) {
        const thisFindingCount = this.findingList.length;
        const thisSessionTimestamp = this.sessionStartTimestamp;
        if (lastFindingCount !== thisFindingCount) this._sendFindings();

        this.searchUptoIndex = searchIndex + 1;
        setTimeout(() => this._find(thisSessionTimestamp, thisFindingCount));
        return;
      }
    }

    if (lastFindingCount !== this.findingList.length || lastFindingCount === 0)
      this._sendFindings();
    this._softReset();
  }

  // Match Search - Validate result
  // All emojis and stickers will come here to be validated whether or not to appear in the search result.
  _match(item) {
    // String
    if (typeof item === 'string') {
      return this._compare(item);
    }

    // Object
    if (typeof item === 'object') {
      // Check Array Values
      if (Array.isArray(this.searchKeys)) {
        return !!this.searchKeys.find((key) => {
          if (typeof item[key] === 'string') {
            return this._compare(item[key]);
          }

          if (Array.isArray(item[key])) {
            for (const value in item[key]) {
              const result = this._compare(item[key][value]);
              if (result) return result;
            }
          }

          return null;
        });
      }

      // String
      if (typeof this.searchKeys === 'string') {
        return this._compare(item[this.searchKeys]);
      }
    }

    // Empty
    return false;
  }

  // Comparator values to confirm
  _compare(item) {
    if (typeof item !== 'string') return false;
    const myItem = this._normalize(item);
    if (this.isContain) return myItem.indexOf(this.term) !== -1;

    return myItem.startsWith(this.term);
  }

  // Normalize validator
  _normalize(item) {
    let myItem = item.normalize(this.normalizeUnicode ? 'NFKC' : 'NFC');
    if (!this.isCaseSensitive) myItem = myItem.toLocaleLowerCase();
    if (this.ignoreWhitespace) myItem = myItem.replace(/\s/g, '');
    return myItem;
  }

  // Complete. Send results
  _sendFindings() {
    tinyAPI.emit(
      'searchResultSent',

      this.findingList,
      this.term,

      {
        searchKeys: this.searchKeys,
        limit: this.limit,
      },
    );

    this.emit(this.RESULT_SENT, this.findingList, this.term);
  }
}

export default AsyncSearch;
