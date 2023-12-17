const resolver = (ext, domain, resolve, ud, ens) => {

    console.log(ext, domain);
    resolve([]);

};

const udResolver = {
    'x': (domain, resolve, customDNS) => resolver('x', domain, resolve, customDNS.ud, customDNS.ens),
    'crypto': (domain, resolve, customDNS) => resolver('crypto', domain, resolve, customDNS.ud, customDNS.ens),
    'nft': (domain, resolve, customDNS) => resolver('nft', domain, resolve, customDNS.ud, customDNS.ens),
    'wallet': (domain, resolve, customDNS) => resolver('wallet', domain, resolve, customDNS.ud, customDNS.ens),
    'polygon': (domain, resolve, customDNS) => resolver('polygon', domain, resolve, customDNS.ud, customDNS.ens),
    'unstoppable': (domain, resolve, customDNS) => resolver('unstoppable', domain, resolve, customDNS.ud, customDNS.ens),
    'blockchain': (domain, resolve, customDNS) => resolver('blockchain', domain, resolve, customDNS.ud, customDNS.ens),
    'dao': (domain, resolve, customDNS) => resolver('dao', domain, resolve, customDNS.ud, customDNS.ens),
    '888': (domain, resolve, customDNS) => resolver('888', domain, resolve, customDNS.ud, customDNS.ens),
    'go': (domain, resolve, customDNS) => resolver('go', domain, resolve, customDNS.ud, customDNS.ens),
    'zil': (domain, resolve, customDNS) => resolver('zil', domain, resolve, customDNS.ud, customDNS.ens),
    'bitcoin': (domain, resolve, customDNS) => resolver('bitcoin', domain, resolve, customDNS.ud, customDNS.ens),
};

export default udResolver;