import encrypt from 'matrix-encrypt-attachment';

import { fetchFn } from '@src/client/initMatrix';
import { avatarDefaultColor } from '@src/app/atoms/avatar/Avatar';
import { readCustomUrl } from '@src/util/libs/mediaCache';

import { colorMXID } from '../colorMXID';
import { getBlobSafeMimeType } from '../mimetypes';

class MxcUrl {
  constructor(mxBase) {
    this.mx = mxBase;
  }

  async getDecryptedBlob(response = null, type = null, decryptData = null) {
    const arrayBuffer = await response.arrayBuffer();
    const dataArray = await encrypt.decryptAttachment(arrayBuffer, decryptData);
    const blob = new Blob([dataArray], { type: getBlobSafeMimeType(type) });
    return blob;
  }

  fetch(link = null, ignoreCustomUrl = false) {
    const tinyLink = !ignoreCustomUrl ? readCustomUrl(link) : link;
    return fetchFn(tinyLink, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.mx.getAccessToken()}`,
      },
    });
  }

  async getBlob(response = null, type = null, tinyLink = '', decryptData = null) {
    if (decryptData !== null && !tinyLink.startsWith('ponyhousetemp://')) {
      const blob = await this.getDecryptedBlob(response, type, decryptData);
      return blob;
    }
    const blob = await response.blob();
    return blob;
  }

  async fetchBlob(link = null, type = null, decryptData = null) {
    const tinyLink = readCustomUrl(link);
    const response = await this.fetch(tinyLink, true);
    return this.getBlob(response, type, tinyLink, decryptData);
  }

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
}

export default MxcUrl;
