import encrypt from 'matrix-encrypt-attachment';

import { fetchFn } from '@src/client/initMatrix';
import { avatarDefaultColor } from '@src/app/atoms/avatar/Avatar';

import { colorMXID } from '../colorMXID';
import { getBlobSafeMimeType } from '../mimetypes';

// getAnimatedImageUrl
// Mxc Url
class MxcUrl {
  // Constructor
  constructor(mxBase) {
    this.mx = mxBase;
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
    const accessToken = typeof this.mx.getAccessToken === 'function' && this.mx.getAccessToken();
    const options = { method: 'GET', headers: {} };
    if (accessToken) options.headers['Authorization'] = `Bearer ${accessToken}`;
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

  // Get Url
  static getNewUrl(src) {
    let url;
    try {
      if (typeof src === 'string') {
        if (!src.startsWith('./')) {
          url = src.startsWith('mxc://') && this.toHttp ? this.toHttp(src) : null;
        } else {
          url = `${location.origin}${location.pathname}${location.pathname.endsWith('/') ? src.substring(2) : src.substring(1)}`;
        }

        url = new URL(url);
        if (
          src.startsWith('./') &&
          __ENV_APP__.ELECTRON_MODE &&
          __ENV_APP__.MODE !== 'development'
        ) {
          const tinyOrigin = location.origin;
          const pathName = location.pathname;
          url._VANILLA_toString = url.toString;
          url.toString = () =>
            `./${url._VANILLA_toString().replace(tinyOrigin, '').replace(pathName, '')}`;
        }
      } else {
        url = null;
      }
    } catch {
      url = null;
    }
    return url;
  }

  // MXC Protocol to Http
  toHttp(mxcUrl, width, height, resizeMethod, allowDirectLinks, allowRedirects) {
    return this.mx.mxcUrlToHttp(
      mxcUrl,
      width,
      height,
      resizeMethod,
      allowDirectLinks,
      allowRedirects,
      // true,
    );
  }

  // Classic getAvatarUrl
  getAvatarUrlClassic(user, width, height, resizeMethod, allowDefault, allowDirectLinks) {
    return user?.getAvatarUrl(
      this.mx.baseUrl,
      width,
      height,
      resizeMethod,
      allowDefault,
      allowDirectLinks,
    );
  }

  // Get Avatar Url
  getAvatarUrl(user, width, height, resizeMethod, allowDefault, allowDirectLinks) {
    if (user) {
      let avatarUrl = this.toHttp(
        user?.getMxcAvatarUrl(),
        width,
        height,
        resizeMethod,
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
