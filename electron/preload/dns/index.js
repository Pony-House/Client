import http from 'http';
import https from 'https';
import path from 'path';
import fs from 'fs';

import { ethers } from 'ethers';
import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';

import fetch from 'node-fetch';
import nativeDns from 'native-node-dns';
import udResolver from './ud';
import ensResolver from './ens';
import { getAppFolders } from '../libs/utils';

// Server
const ttl = 600;
const server = nativeDns.createServer();
const resolver = new dns.Resolver();
let startedDNS = false;
let useCustomDns = false;
let folders = null;

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
  if (
    Array.isArray(request.question) &&
    request.question[0] &&
    typeof request.question[0].name === 'string'
  ) {
    // Resolver
    const resolverDefault = (addresses) => {
      // Check DNS Address
      if (Array.isArray(addresses)) {
        for (const item in addresses) {
          if (typeof addresses[item] === 'string' && ipaddr.isValid(addresses[item])) {
            const ip = ipaddr.parse(addresses[item]);
            const type = ip.kind();

            if (type === 'ipv4') {
              response.answer.push(
                nativeDns.A({
                  name: request.question[0].name,
                  address: addresses[item],
                  ttl,
                }),
              );
            } else if (type === 'ipv6') {
              response.answer.push(
                nativeDns.AAAA({
                  name: request.question[0].name,
                  address: addresses[item],
                  ttl,
                }),
              );
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

    if (typeof ops.ens === 'string') customDNS.ens = new ethers.JsonRpcProvider(ops.ens);
    if (typeof ops.ud.polygon === 'string')
      customDNS.ud.polygon = new ethers.JsonRpcProvider(ops.ud.polygon);

    const serverAddress = `127.0.0.1:${String(ops.port)}`;
    resolver.setServers([serverAddress]);

    console.log(
      `[custom-dns]${ops.devMode ? ' [dev-mode] 1 number in the port value was decreased to avoid conflict with the production version. ' : ' '}Server started at ${serverAddress}`,
    );
  }
}

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

// Templates insert
const staticDnsAgent = (scheme) => {
  const httpModule = scheme === 'http' ? http : https;
  return new httpModule.Agent({ lookup: staticLookup() });
};

const insertMatrixAgent = (type = 'https') => staticDnsAgent(type);
const agents = {
  http: insertMatrixAgent('http'),
  https: insertMatrixAgent('https'),
};

// DNS list
const dnsWays = {};

// HTTP Base
const httpDnsTemplate = (protocol) => (href, ops, resolve, reject) => {
  if (startedDNS && useCustomDns) ops.agent = agents[protocol];
  if (ops.signal) delete ops.signal;
  fetch(href, ops)
    .then((res) => {
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
    })
    .catch(reject);
};

// HTTP Modules
dnsWays.http = httpDnsTemplate('http');
dnsWays.https = httpDnsTemplate('https');

// Read Temp Data
dnsWays.ponyhousetemp = async (href, ops, resolve, reject) => {
  try {
    const { pathname } = new URL(href);
    if (!folders) folders = await getAppFolders();

    const pathToServe = path.resolve(__dirname, pathname);
    const isSafe = pathToServe && !pathToServe.startsWith('..') && path.isAbsolute(pathToServe);
    if (!isSafe) {
      return new Response('bad', {
        status: 400,
        headers: { 'content-type': 'text/html' },
      });
    }

    const filePath = href.slice('ponyhousetemp://'.length);
    const file = path.join(folders.tempMedia, filePath);
    const data = {};

    let fileData = null;
    fileData = fs.readFileSync(file, { encoding: 'utf8' });
    const stats = fs.statSync(file);

    const headers = {};
    headers['access-control-allow-origin'] = '*';
    headers['cache-control'] = 'max-age=300';
    headers['cross-origin-resource-policy'] = 'cross-origin';
    headers.date = new Date(stats.mtime).toUTCString();
    headers.expires = new Date().toUTCString();
    headers['source-age'] = '0';
    headers['x-served-by'] = 'electron-cache';

    data.headers = {};
    for (const item in headers) {
      data.headers[item] = headers[item];
    }

    data.headers.get = (value) => headers[value];
    data.headers.raw = () => JSON.stringify(headers);

    data.status = 200;
    data.statusText = 'Complete from the client cache.';
    data.ok = true;

    data.size = stats.size;
    data.timeout = -1;
    data.url = href;
    data.redirected = false;

    data.json = () => JSON.parse(fileData);
    data.clone = () => {};
    data.text = () => fileData;
    data.arrayBuffer = () => {
      const arr = new Uint8Array(fileData.length / 8);
      for (let i = 0; i < fileData.length; i += 8) {
        arr[i / 8] = parseInt(fileData.slice(i, i + 8), 2);
      }
      return arr;
    };

    data.blob = () => new Blob([data.arrayBuffer()]);
    data.formData = () => {};

    if (ops.method === 'HEAD') {
      headers['content-length'] = String(stats.size);
      headers['content-type'] = data.arrayBuffer()['Symbol(type)'];
    }

    resolve(data);
  } catch (err) {
    reject(err);
  }
};

// Module base
export default (href, ops = {}) =>
  new Promise((resolve, reject) => {
    const url = new URL(href);
    const protocol = url.protocol.substring(0, url.protocol.length - 1);
    const dnsFunction = dnsWays[protocol];
    if (typeof dnsFunction === 'function') {
      dnsFunction(href, ops, resolve, reject, protocol);
    } else {
      reject(new Error('INVALID URL TYPE!'));
    }
  });
