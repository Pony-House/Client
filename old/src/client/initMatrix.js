const fetchBase = (url, ops) => {
    if (typeof global.nodeFetch === 'function') return global.nodeFetch(url.href, ops);
    return global.fetch(url.href, ops);
};

const fetchFn = __ENV_APP__.ELECTRON_MODE
    ? (url, ops) => fetchBase({ href: url }, ops)
    : global.fetch;

const startCustomDNS = () => {
    if (__ENV_APP__.ELECTRON_MODE) {
        if (typeof global.startCustomDNS === 'function') {
            global.startCustomDNS({
                port:
                    __ENV_APP__.MODE !== 'development'
                        ? __ENV_APP__.CUSTOM_DNS.PORT
                        : __ENV_APP__.CUSTOM_DNS.PORT - 1,
                devMode: __ENV_APP__.MODE === 'development',
                enabled: __ENV_APP__.CUSTOM_DNS.ENABLED,

                ud: {
                    polygon: __ENV_APP__.CUSTOM_DNS.BLOCKCHAIN.ud.polygon,
                },

                ens: __ENV_APP__.CUSTOM_DNS.BLOCKCHAIN.ens,
            });
        }
    }
};