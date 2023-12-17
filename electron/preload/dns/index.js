import http from 'http';
import https from 'https';

import { Web3 } from 'web3';
import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';

import fetch from 'node-fetch';
import nativeDns from 'native-node-dns';
import udResolver from './ud';
import ensResolver from './ens';

// Server
const ttl = 600;
const server = nativeDns.createServer();
const resolver = new dns.Resolver();
let startedDNS = false;
let useCustomDns = false;

// Blockchain Data
const customDNS = {

    ud: {
        polygon: null,
    },

    ens: null,

};

// Custom Domain Resolvers
const domainResolvers = { eth: ensResolver };
for (const item in udResolver) {
    domainResolvers[item] = udResolver[item];
}

// Request detector
server.on('request', (request, response) => {

    // Checker
    if (Array.isArray(request.question) && request.question[0] && typeof request.question[0].name === 'string') {

        // Resolver
        const resolverDefault = (addresses) => {

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

        // Custom Resolver
        const name = request.question[0].name.split('.');
        const ext = name[name.length - 1];
        if (typeof domainResolvers[ext] === 'function') {
            domainResolvers[ext](request.question[0].name, resolverDefault, customDNS);
        }

        // Default. Excute Default OS Resolver
        else {
            dns.resolve(request.question[0].name).then(resolverDefault).catch(console.error);
        }

    }

    // Nope
    else {
        response.send();
    }

});

// Error
server.on('error', console.error);

// Start
export function startCustomDNS(ops = {}) {
    if (!startedDNS) {

        useCustomDns = ops.enabled;
        startedDNS = true;
        server.serve(ops.port);

        if (typeof ops.ens === 'string') customDNS.ens = new Web3(ops.ens);
        if (typeof ops.ud.polygon === 'string') customDNS.ud.polygon = new Web3(ops.ud.polygon);

        const serverAddress = `127.0.0.1:${String(ops.port)}`;
        resolver.setServers([serverAddress]);

        console.log(`[custom-dns]${ops.devMode ? ' [dev-mode] 1 number in the port value was decreased to avoid conflict with the production version. ' : ' '}Server started at ${serverAddress}`);

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
    if (startedDNS) {

        if (!tinyCache[hostname]) {
            const ips = await resolver.resolve(hostname);
            tinyCache[hostname] = { ips, timeout: 60 };
        }

        const ips = tinyCache[hostname].ips;
        if (ips.length === 0) {
            throw new Error(`Unable to resolve ${hostname}`);
        }

        cb(null, ips[0], 4);

    } else {
        setTimeout(() => staticLookup(hostname, _, cb), 1000);
    }
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
        if (startedDNS && useCustomDns) ops.agent = agents[href.startsWith('https://') ? 'https' : 'http'];
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