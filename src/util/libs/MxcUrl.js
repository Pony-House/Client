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
}

export default MxcUrl;
