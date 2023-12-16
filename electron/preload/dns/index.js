import http from 'http';
import https from 'https';

import dns from 'dns/promises';
import { Resolver } from 'node:dns';
import ipaddr from 'ipaddr.js';

import fetch from 'node-fetch';
import nativeDns from 'native-node-dns';

// Server
const ttl = 600;
const server = nativeDns.createServer();
const resolver = new Resolver();
let startedDNS = false;

// Request detector
server.on('request', (request, response) => {

    // Show Domain
    console.log('Custom DNS -->', request.question[0].name);

    // Resolver
    const resolverDefault = (err, addresses) => {

        // Check DNS Address
        if (Array.isArray(addresses)) {
            for (const item in addresses) {
                if (typeof addresses[item] === 'string' && ipaddr.isValid(addresses[item])) {

                    const ip = ipaddr.parse(addresses[item]);
                    const type = ip.kind();

                    if (type === 'ipv4') {
                        response.answer.push(nativeDns.A({
                            name: request.question[0].name,
                            address: addresses[item],
                            ttl,
                        }));
                    }

                    else if (type === 'ipv6') {
                        response.answer.push(nativeDns.AAAA({
                            name: request.question[0].name,
                            address: addresses[item],
                            ttl,
                        }));
                    }

                }
            }
        }

        // Complete
        response.send();

    };

    // Excute default resolver
    dns.resolve(request.question[0].name, resolverDefault);

});

// Error
server.on('error', console.error);

// Start
export function startCustomDNS(customDnsPort) {
    if (!startedDNS) {

        startedDNS = true;
        server.serve(customDnsPort);

        const serverAddress = `127.0.0.1:${String(customDnsPort)}`;
        resolver.setServers([serverAddress]);

        console.log(`[custom-dns] Server started at ${serverAddress}`);

    }
};

// Cache
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

// Send lookup
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
const agents = {
    http: insertMatrixAgent('http'),
    https: insertMatrixAgent('https'),
};

export default (href, ops = {}) => new Promise((resolve, reject) => {
    if (href.startsWith('https://') || href.startsWith('http://')) {
        if (startedDNS) ops.agent = agents[href.startsWith('https://') ? 'https' : 'http'];
        if (ops.signal) delete ops.signal;
        fetch(href, ops).then(res => {

            const headers = {};
            for (const item in res.headers) {
                if (typeof res.headers[item] === 'string' || typeof res.headers[item] === 'number') {
                    headers[item] = res.headers[item];
                }
            }

            headers.get = (value) => res.headers.get(value);
            headers.raw = () => res.headers.raw();

            resolve({

                status: res.status,
                statusText: res.statusText,
                ok: res.ok,

                size: res.size,
                timeout: res.timeout,
                url: res.url,
                redirected: res.redirected,
                headers,

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