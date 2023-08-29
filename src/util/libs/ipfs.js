export function getIpfsCfg(folder, getDefault = true) {

    let content = global.localStorage.getItem('ponyHouse-ipfs');

    try {
        content = JSON.parse(content) ?? {};
    } catch (err) {
        content = {};
    }

    if (getDefault) {
        content.publicGateway = typeof content.publicGateway === 'string' && content.publicGateway.length > 0 ? content.publicGateway : 'https://ipfs.io/';
        content.subdomainPublicGateway = typeof content.subdomainPublicGateway === 'string' && content.subdomainPublicGateway.length > 0 ? content.subdomainPublicGateway : 'https://dweb.link/';
        content.apiIpfs = typeof content.apiIpfs === 'string' && content.apiIpfs.length > 0 ? content.apiIpfs : 'http://127.0.0.1:5001/';
        content.localGateway = typeof content.localGateway === 'string' && content.localGateway.length > 0 ? content.localGateway : 'http://localhost:8080/';
    }

    if (typeof folder === 'string' && folder.length > 0) {
        if (typeof content[folder] !== 'undefined') return content[folder];
        return null;
    }

    return content;

};

export function setIpfsCfg(folder, value) {
    const content = getIpfsCfg(null, false);
    content[folder] = value;
    global.localStorage.setItem('ponyHouse-ipfs', JSON.stringify(content));
};

export function convertIpfsGateway(tinyUrl) {

    const cfg = getIpfsCfg();

    const url = new URL(tinyUrl);

};

global.ipfsApi = {
    convertGateway: convertIpfsGateway,
    getCfg: getIpfsCfg,
    setCfg: setIpfsCfg,
};