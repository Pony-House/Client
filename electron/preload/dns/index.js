import http from 'http';
import https from 'https';
import dns from 'dns/promises';

const tinyCache = {};

setInterval(() => {
    for (const hostname in tinyCache) {
        if (tinyCache[hostname].timeout > 0) {
            delete tinyCache[hostname];
        } else {
            tinyCache[hostname].timeout--;
        }
    }
}, 60000);

const staticLookup = () => async (hostname, _, cb) => {

    if (!tinyCache[hostname]) {
        tinyCache[hostname] = { ips: await dns.resolve(hostname), timeout: 60 };
    }

    const ips = tinyCache[hostname];
    if (ips.length === 0) {
        throw new Error(`Unable to resolve ${hostname}`);
    }

    // console.log(ips);
    cb(null, ips[0], 4);

};

const staticDnsAgent = (scheme) => {
    const httpModule = scheme === 'http' ? http : https;
    return new httpModule.Agent({ lookup: staticLookup() });
};

const insertMatrixAgent = (type = 'https') => staticDnsAgent(type);
export default insertMatrixAgent;