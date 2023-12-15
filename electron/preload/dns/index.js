import http from 'http';
import https from 'https';
import dns from 'dns/promises';
import fetch from 'node-fetch';

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

    const ips = tinyCache[hostname].ips;
    if (ips.length === 0) {
        throw new Error(`Unable to resolve ${hostname}`);
    }

    cb(null, ips[0], 4);

};

const staticDnsAgent = (scheme) => {
    const httpModule = scheme === 'http' ? http : https;
    return new httpModule.Agent({ lookup: staticLookup() });
};

const insertMatrixAgent = (type = 'https') => staticDnsAgent(type);
export default (href, ops) => new Promise((resolve, reject) => {
    if (href.startsWith('https://') || href.startsWith('http://')) {
        ops.agent = insertMatrixAgent(!href.startsWith('http://') ? 'https' : 'http');
        if (ops.signal) delete ops.signal;
        fetch(href, ops).then(res => {
            console.log(res);
            resolve({

                status: res.status,
                statusText: res.statusText,
                ok: res.ok,

                size: res.size,
                timeout: res.timeout,
                url: res.url,
                redirected: res.redirected,

                headers: res.headers,

                json: () => res.json(),
                clone: () => res.clone(),
                text: () => res.text(),
                arrayBuffer: () => res.arrayBuffer(),
                blob: () => res.blob(),
                formData: () => res.formData(),

            });
        }).catch(reject);
    } else { reject(new Error('INVALID URL TYPE!')); }
});