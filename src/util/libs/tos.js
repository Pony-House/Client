import initMatrix from '../../client/initMatrix';

class MatrixTerms {
  constructor(baseUrl = initMatrix.matrixClient.baseUrl) {
    this.mx = initMatrix.matrixClient;
    this.baseUrl = baseUrl;

    this.is = this.mx.termsUrlForService('SERVICE_TYPE_IS', this.baseUrl);
    this.im = this.mx.termsUrlForService('SERVICE_TYPE_IM', this.baseUrl);
  }

  getTerms(type) {
    if (type === 'is' || type === 'im')
      return this.mx.getTerms(
        type === 'is' ? 'SERVICE_TYPE_IS' : type === 'im' ? 'SERVICE_TYPE_IM' : null,
        this.baseUrl,
      );

    throw new Error('Invalid terms type!');
  }

  agreeToTerms(type) {
    if (type === 'is' || type === 'im')
      return this.mx.agreeToTerms(
        type === 'is' ? 'SERVICE_TYPE_IS' : type === 'im' ? 'SERVICE_TYPE_IM' : null,
        this.baseUrl,
        this.mx.getAccessToken(),
        [this[type].href],
      );

    throw new Error('Invalid terms type!');
  }
}

export default MatrixTerms;
