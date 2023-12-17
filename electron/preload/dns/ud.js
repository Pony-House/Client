const resolver = (ext, domain, resolve, udDnsIps) => {
    // console.log(ext, domain, udDnsIps);
    resolve([]);
};

const udResolver = {
    'x': (domain, resolve, customDNS) => resolver('x', domain, resolve, customDNS.ud),
    'crypto': (domain, resolve, customDNS) => resolver('crypto', domain, resolve, customDNS.ud),
    'nft': (domain, resolve, customDNS) => resolver('nft', domain, resolve, customDNS.ud),
    'wallet': (domain, resolve, customDNS) => resolver('wallet', domain, resolve, customDNS.ud),
    'polygon': (domain, resolve, customDNS) => resolver('polygon', domain, resolve, customDNS.ud),
    'unstoppable': (domain, resolve, customDNS) => resolver('unstoppable', domain, resolve, customDNS.ud),
    'blockchain': (domain, resolve, customDNS) => resolver('blockchain', domain, resolve, customDNS.ud),
    'dao': (domain, resolve, customDNS) => resolver('dao', domain, resolve, customDNS.ud),
    '888': (domain, resolve, customDNS) => resolver('888', domain, resolve, customDNS.ud),
    'go': (domain, resolve, customDNS) => resolver('go', domain, resolve, customDNS.ud),
    'zil': (domain, resolve, customDNS) => resolver('zil', domain, resolve, customDNS.ud),
    'bitcoin': (domain, resolve, customDNS) => resolver('bitcoin', domain, resolve, customDNS.ud),
};

export default udResolver;