const resolver = (domain, resolve, udDnsIps) => {
    resolve([]);
};

const udResolver = {
    'x': (domain, resolve, customDNS) => resolver('x', resolve, customDNS.ud),
    'crypto': (domain, resolve, customDNS) => resolver('crypto', resolve, customDNS.ud),
    'nft': (domain, resolve, customDNS) => resolver('nft', resolve, customDNS.ud),
    'wallet': (domain, resolve, customDNS) => resolver('wallet', resolve, customDNS.ud),
    'polygon': (domain, resolve, customDNS) => resolver('polygon', resolve, customDNS.ud),
    'unstoppable': (domain, resolve, customDNS) => resolver('unstoppable', resolve, customDNS.ud),
    'blockchain': (domain, resolve, customDNS) => resolver('blockchain', resolve, customDNS.ud),
    'dao': (domain, resolve, customDNS) => resolver('dao', resolve, customDNS.ud),
    '888': (domain, resolve, customDNS) => resolver('888', resolve, customDNS.ud),
    'go': (domain, resolve, customDNS) => resolver('go', resolve, customDNS.ud),
    'zil': (domain, resolve, customDNS) => resolver('zil', resolve, customDNS.ud),
    'bitcoin': (domain, resolve, customDNS) => resolver('bitcoin', resolve, customDNS.ud),
};

export default udResolver;