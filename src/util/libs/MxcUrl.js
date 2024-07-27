import encrypt from 'matrix-encrypt-attachment';
import EventEmitter from 'events';
import { generateApiKey } from 'generate-api-key';

import { fetchFn } from '@src/client/initMatrix';
import { avatarDefaultColor } from '@src/app/atoms/avatar/Avatar';

import { colorMXID } from '../colorMXID';
import { getBlobSafeMimeType } from '../mimetypes';

// Mxc Url
class MxcUrl extends EventEmitter {
  // Constructor
  constructor(mxBase) {
    super();
    this.mx = mxBase;
    this._fetchWait = {};
    this._isAuth = false;
    this.setMaxListeners(__ENV_APP__.MAX_LISTENERS);
  }

  // Set Auth Mode
  setAuthMode(value) {
    if (typeof value === 'boolean') this._isAuth = value;
  }

  isAuth() {
    return this._isAuth;
  }

  // Check Url Cache
  _checkUrlCache(url, type = '') {
    if (typeof global.cacheFileElectron === 'function') {
      return global.cacheFileElectron(url, type);
    }
    return url;
  }

  // Image
  readImageUrl(url) {
    if (!__ENV_APP__.ELECTRON_MODE) return url;
    return this._checkUrlCache(url, 'img');
  }

  // Custom
  readCustomUrl(url, type) {
    if (!__ENV_APP__.ELECTRON_MODE) return url;
    return this._checkUrlCache(url, type);
  }

  // Video
  readVideoUrl(url) {
    if (!__ENV_APP__.ELECTRON_MODE) return url;
    return this._checkUrlCache(url, 'video');
  }

  // Audio
  readAudioUrl(url) {
    if (!__ENV_APP__.ELECTRON_MODE) return url;
    return this._checkUrlCache(url, 'audio');
  }

  // Decrypt Blob
  async getDecryptedBlob(response = null, type = null, decryptData = null) {
    const arrayBuffer = await response.arrayBuffer();
    const dataArray = await encrypt.decryptAttachment(arrayBuffer, decryptData);
    const blob = new Blob([dataArray], { type: getBlobSafeMimeType(type) });
    return blob;
  }

  // Fetch Url
  fetch(link = null, ignoreCustomUrl = false) {
    const tinyLink = !ignoreCustomUrl ? this.readCustomUrl(link) : link;
    const options = { method: 'GET', headers: {} };
    if (this._isAuth && link.startsWith(`${this.mx.baseUrl}/`)) {
      const accessToken = typeof this.mx.getAccessToken === 'function' && this.mx.getAccessToken();
      if (accessToken) options.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return fetchFn(tinyLink, options);
  }

  // Get Fetch Blob
  async getBlob(response = null, type = null, tinyLink = '', decryptData = null) {
    if (decryptData !== null && !tinyLink.startsWith('ponyhousetemp://')) {
      const blob = await this.getDecryptedBlob(response, type, decryptData);
      return blob;
    }
    const blob = await response.blob();
    return blob;
  }

  // Fetch Blob
  async fetchBlob(link = null, type = null, decryptData = null) {
    const tinyLink = this.readCustomUrl(link);
    const response = await this.fetch(tinyLink, true);
    return this.getBlob(response, type, tinyLink, decryptData);
  }

  // Focus Fetch Blob
  async focusFetchBlob(link = null, type = null, decryptData = null) {
    const tinyThis = this;
    return new Promise((resolve, reject) => {
      if (!tinyThis._fetchWait[link]) {
        tinyThis._fetchWait[link] = true;
        tinyThis
          .fetchBlob(link, type, decryptData)
          // Complete
          .then((result) => {
            tinyThis.emit(`fetchBlob:then:${link}`, result);
            delete tinyThis._fetchWait[link];
            resolve(result);
          })
          // Error
          .catch((err) => {
            tinyThis.emit(`fetchBlob:catch:${link}`, err);
            delete tinyThis._fetchWait[link];
            reject(err);
          });
      }

      // Wait
      else {
        const funcs = {};
        const key = generateApiKey();

        const tinyComplete = (isResolve) => {
          if (isResolve) tinyThis.off(`fetchBlob:catch:${link}`, funcs[`${key}_TinyReject`]);
          else tinyThis.off(`fetchBlob:then:${link}`, funcs[`${key}_TinyResolve`]);
        };

        funcs[`${key}_TinyResolve`] = (result) => {
          resolve(result);
          tinyComplete(true);
        };
        funcs[`${key}_TinyReject`] = (err) => {
          reject(err);
          tinyComplete(false);
        };

        tinyThis.once(`fetchBlob:then:${link}`, funcs[`${key}_TinyResolve`]);
        tinyThis.once(`fetchBlob:catch:${link}`, funcs[`${key}_TinyReject`]);
      }
    });
  }

  // MXC Protocol to Http
  toHttp(
    mxcUrl,
    width,
    height,
    resizeMethod = 'scale',
    allowDirectLinks = undefined,
    allowRedirects = undefined,
  ) {
    if (typeof mxcUrl === 'string')
      return this.mx.mxcUrlToHttp(
        mxcUrl,
        width,
        height,
        height || width ? resizeMethod : undefined,
        allowDirectLinks,
        allowRedirects,
        this._isAuth,
      );
    return null;
  }

  // Classic getAvatarUrl
  getAvatarUrlClassic(
    user,
    width,
    height,
    resizeMethod = 'scale',
    allowDefault = undefined,
    allowDirectLinks = undefined,
  ) {
    return user?.getAvatarUrl(
      this.mx.baseUrl,
      width,
      height,
      height || width ? resizeMethod : undefined,
      allowDefault,
      allowDirectLinks,
    );
  }

  // Get Avatar Url
  getAvatarUrl(
    user,
    width,
    height,
    resizeMethod = 'scale',
    allowDefault = undefined,
    allowDirectLinks = undefined,
  ) {
    if (user) {
      let avatarUrl = this.toHttp(
        user?.getMxcAvatarUrl(),
        width,
        height,
        height || width ? resizeMethod : undefined,
        allowDirectLinks,
      );
      if (!avatarUrl && allowDefault) {
        avatarUrl = avatarDefaultColor(colorMXID(user.userId || user.roomId));
      }
      return avatarUrl;
    }
    return null;
  }

  validUrl(mxcUrl) {
    if (typeof mxcUrl === 'string') {
      const mxc = mxcUrl.split('/');

      if (mxc.length === 4 && mxc[0] && mxc[1] === '' && mxc[2] && mxc[3]) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
}

// Class Module
export default MxcUrl;
