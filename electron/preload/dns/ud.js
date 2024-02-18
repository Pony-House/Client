// https://docs.unstoppabledomains.com/resolution/guides/records-reference/#dns-records
import { Contract } from 'ethers';

// Create Polygon
const createPolygon = (provider) => {
  const udPolygonAbi = [
    {
      inputs: [{ internalType: 'string[]', name: 'labels', type: 'string[]' }],
      name: 'namehash',
      outputs: [{ internalType: 'uint256', name: 'hash', type: 'uint256' }],
      stateMutability: 'pure',
      type: 'function',
    },

    {
      inputs: [
        { internalType: 'string[]', name: 'keys', type: 'string[]' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'getMany',
      outputs: [{ internalType: 'string[]', name: 'values', type: 'string[]' }],
      stateMutability: 'view',
      type: 'function',
    },

    {
      inputs: [
        { internalType: 'string', name: 'key', type: 'string' },
        { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      ],
      name: 'get',
      outputs: [{ internalType: 'string', name: 'value', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const contract = new Contract(
    '0xa9a6a3626993d487d2dbda3173cf58ca1a9d9e9f',
    udPolygonAbi,
    provider,
  );
  return contract || {};
};

// Resolver
const contracts = {};
const resolver = (domain, resolve, ud /* ens */) => {
  // Polygon
  if (!contracts.polygon && ud.polygon) contracts.polygon = createPolygon(ud.polygon);
  if (contracts.polygon.getMany) {
    contracts.polygon.namehash
      .staticCall(domain.split('.'))
      .then((tokenId) => {
        contracts.polygon.getMany
          .staticCall(
            [
              'dns.A',
              // 'dns.A.ttl',
              'dns.AAAA',
              // 'dns.AAAA.ttl',
            ],
            tokenId,
          )
          .then((ipArray) => {
            // Get Polygon Ips
            const domains = [];

            // Insert Domains
            const insertDomains = (ips) => {
              if (Array.isArray(ips)) {
                for (const item2 in ips) {
                  domains.push(ips[item2]);
                }
              }
            };

            if (Array.isArray(ipArray) && ipArray.length > 0) {
              for (const item in ipArray) {
                // Convert to Array
                let tinyValue =
                  typeof ipArray[item] === 'string' ? ipArray[item].trim() : ipArray[item];
                if (typeof tinyValue === 'string' && tinyValue.length > 0) {
                  try {
                    tinyValue = JSON.parse(tinyValue);
                    insertDomains(tinyValue);
                  } catch (err) {
                    console.error(err);
                  }
                }

                // Insert time
                insertDomains(tinyValue);
              }
            }

            // Complete
            resolve(domains);
          })
          .catch((err) => {
            console.error(err);
            resolve(null);
          });
      })
      .catch((err) => {
        console.error(err);
        resolve(null);
      });
  } else {
    resolve(null);
  }
};

// Domains
const udResolver = {
  x: (domain, resolve, customDNS) => resolver(domain, resolve, customDNS.ud, customDNS.ens),
  crypto: (domain, resolve, customDNS) => resolver(domain, resolve, customDNS.ud, customDNS.ens),
  nft: (domain, resolve, customDNS) => resolver(domain, resolve, customDNS.ud, customDNS.ens),
  wallet: (domain, resolve, customDNS) => resolver(domain, resolve, customDNS.ud, customDNS.ens),
  polygon: (domain, resolve, customDNS) => resolver(domain, resolve, customDNS.ud, customDNS.ens),
  unstoppable: (domain, resolve, customDNS) =>
    resolver(domain, resolve, customDNS.ud, customDNS.ens),
  blockchain: (domain, resolve, customDNS) =>
    resolver(domain, resolve, customDNS.ud, customDNS.ens),
  dao: (domain, resolve, customDNS) => resolver(domain, resolve, customDNS.ud, customDNS.ens),
  888: (domain, resolve, customDNS) => resolver(domain, resolve, customDNS.ud, customDNS.ens),
  go: (domain, resolve, customDNS) => resolver(domain, resolve, customDNS.ud, customDNS.ens),
  zil: (domain, resolve, customDNS) => resolver(domain, resolve, customDNS.ud, customDNS.ens),
  bitcoin: (domain, resolve, customDNS) => resolver(domain, resolve, customDNS.ud, customDNS.ens),
};

export default udResolver;
