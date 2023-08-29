import CIDTool from 'cid-tool';

export function getIpfsCfg(folder, getDefault = true, domainsParse = false) {

    let content = global.localStorage.getItem('ponyHouse-ipfs');

    try {
        content = JSON.parse(content) ?? {};
    } catch (err) {
        content = {};
    }

    if (getDefault) {

        content.ipfsEnabled = typeof content.ipfsEnabled === 'boolean' ? content.ipfsEnabled : true;
        content.useGatewayOnOpen = typeof content.useGatewayOnOpen === 'boolean' ? content.useGatewayOnOpen : true;

        content.publicGateway = typeof content.publicGateway === 'string' && content.publicGateway.length > 0 ? content.publicGateway : 'https://ipfs.io/';
        if (domainsParse) {
            try {
                content.publicGateway = new URL(content.publicGateway);
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        }

        content.subdomainPublicGateway = typeof content.subdomainPublicGateway === 'string' && content.subdomainPublicGateway.length > 0 ? content.subdomainPublicGateway : 'https://dweb.link/';
        if (domainsParse) {
            try {
                content.subdomainPublicGateway = new URL(content.subdomainPublicGateway);
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        }

        content.apiIpfs = typeof content.apiIpfs === 'string' && content.apiIpfs.length > 0 ? content.apiIpfs : 'http://127.0.0.1:5001/';
        if (domainsParse) {
            try {
                content.apiIpfs = new URL(content.apiIpfs);
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        }

        content.localGateway = typeof content.localGateway === 'string' && content.localGateway.length > 0 ? content.localGateway : 'http://localhost:8080/';
        if (domainsParse) {
            try {
                content.localGateway = new URL(content.localGateway);
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        }


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

export function convertIpfsGateway(tinyUrl, vanillaUrl, type = 'base32') {

    const cfg = getIpfsCfg(null, true, true);


    let url;
    if (typeof tinyUrl === 'string') {
        url = new URL(tinyUrl);
    } else {
        url = tinyUrl;
    }

    if (typeof vanillaUrl === 'string' && url.protocol === 'ipfs:' && cfg.ipfsEnabled && cfg.useGatewayOnOpen && cfg.subdomainPublicGateway) {

        const hash = vanillaUrl.substring(
            url.protocol.length + 2,
            vanillaUrl.length -
            Number(typeof url.port === 'string' && url.port.length > 0 ? url.port.length + 1 : 0) - url.search.length -
            Number(typeof url.pathname === 'string' && url.pathname !== '/' ? url.pathname.length : 0)
        );

        if (typeof CIDTool[type] === 'function') {

            url.host = `${CIDTool[type](hash)}.${cfg.subdomainPublicGateway.host}`;
            url.hostname = `${CIDTool[type](hash)}.${cfg.subdomainPublicGateway.hostname}`;

            url.port = cfg.subdomainPublicGateway.port;
            url.protocol = cfg.subdomainPublicGateway.protocol;

        } else {

            url.host = cfg.publicGateway.host;
            url.hostname = cfg.publicGateway.hostname;

            url.pathname = `/ipfs/${hash}${url.pathname}`;

            url.port = cfg.publicGateway.port;
            url.protocol = cfg.publicGateway.protocol;

        }

        url.origin = `${url.protocol}//${url.hostname}${typeof url.port === 'string' && url.port.length > 0 ? `:${url.port}` : ''}`;
        url.href = `${url.protocol}//${url.hostname}${typeof url.port === 'string' && url.port.length > 0 ? `:${url.port}` : ''}${url.pathname}${url.search}`;

    }

    return url;

};

global.ipfsApi = {
    convertGateway: convertIpfsGateway,
    getCfg: getIpfsCfg,
    setCfg: setIpfsCfg,
};