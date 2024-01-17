import initMatrix from "../../client/initMatrix";

class MatrixTerms {

    constructor() {

        this.mx = initMatrix.matrixClient;
        this.is = this.mx.termsUrlForService('SERVICE_TYPE_IS', this.mx.baseUrl);
        this.im = this.mx.termsUrlForService('SERVICE_TYPE_IM', this.mx.baseUrl);

    }

    getTerms(type) {

        if (type === 'is' || type === 'im') return this.mx.getTerms(
            type === 'is' ? 'SERVICE_TYPE_IS' : type === 'im' ? 'SERVICE_TYPE_IM' : null,
            this.mx.baseUrl
        );

        throw new Error('Invalid terms type!');

    }

    agreeToTerms(type) {

        if (type === 'is' || type === 'im') return this.mx.agreeToTerms(
            type === 'is' ? 'SERVICE_TYPE_IS' : type === 'im' ? 'SERVICE_TYPE_IM' : null,
            this.mx.baseUrl,
            this.mx.getAccessToken(),
            [this[type]]
        );

        throw new Error('Invalid terms type!');

    }

};

export default MatrixTerms;