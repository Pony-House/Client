import { avatarDefaultColor } from '@src/app/atoms/avatar/Avatar';
import { colorMXID } from '../colorMXID';

class MxcUrl {
  constructor(mxBase) {
    this.mx = mxBase;
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

  _getAvatarUrl(user, width, height, resizeMethod, allowDefault, allowDirectLinks) {
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
