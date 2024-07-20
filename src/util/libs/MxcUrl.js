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

  getAvatarUrl(user, width, height, resizeMethod, allowDefault, allowDirectLinks) {
    return user?.getAvatarUrl(
      this.mx.baseUrl,
      width,
      height,
      resizeMethod,
      allowDefault,
      allowDirectLinks,
    );
  }
}

export default MxcUrl;
