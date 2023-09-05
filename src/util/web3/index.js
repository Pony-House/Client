import { EventEmitter } from 'events';
import clone from 'clone';
import { objType } from '../tools';

const defaultNetworks = {

  // Ethereum
  ethereum: {

    chainId: '0x1',
    chainIdInt: 1,
    rpcUrls: ['https://cloudflare-eth.com/'],
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://etherscan.com/'],
    blockExplorerApis: ['https://api.etherscan.io/'],

    // https://docs.uniswap.org/contracts/v2/reference/smart-contracts/factory
    factory: ['0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'],

  },

  // Polygon (MATIC)
  matic: {

    chainId: '0x89',
    chainIdInt: 137,
    rpcUrls: ['https://polygon-rpc.com/'],
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    blockExplorerUrls: ['https://polygonscan.com/'],
    blockExplorerApis: ['https://api.polygonscan.com/'],

    // https://docs.quickswap.exchange/reference/smart-contracts/v3/01-factory
    factory: ['0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28'],

  },

  // Binsnace Smart Chain (BEP20)
  bsc: {

    chainId: '0x38',
    chainIdInt: 56,
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    chainName: 'Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    blockExplorerUrls: ['https://bscscan.com/'],
    blockExplorerApis: ['https://api.bscscan.com/'],

    // https://docs.pancakeswap.finance/code/smart-contracts/pancakeswap-exchange/v2/factory-v2
    factory: ['0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'],

  },

  // Gnosis Chain (USD)
  gnosis: {

    chainId: '0x64',
    chainIdInt: 100,
    rpcUrls: ['https://rpc.gnosischain.com/'],
    chainName: 'Gnosis',
    nativeCurrency: {
      name: 'xDai',
      symbol: 'xDAI',
      decimals: 18
    },
    blockExplorerUrls: ['https://gnosisscan.io/'],
    blockExplorerApis: ['https://api.gnosisscan.io/'],

    factory: [],

  },

  // Avalanche Network
  avax: {

    chainId: '0xa86a',
    chainIdInt: 43114,
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    chainName: 'Avalanche Network',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    },
    blockExplorerUrls: ['https://snowtrace.io/'],
    blockExplorerApis: ['https://api.snowtrace.io/'],

    factory: [],

  },

  // Optimism Mainnet
  op: {

    chainId: '0xa',
    chainIdInt: 10,
    rpcUrls: ['https://mainnet.optimism.io/'],
    chainName: 'Optimism Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://explorer.optimism.io/'],
    blockExplorerApis: ['https://api-optimistic.etherscan.io/'],

    factory: [],

  },

  // Base
  base: {

    chainId: '0x2105',
    chainIdInt: 8453,
    rpcUrls: ['https://mainnet.base.org/'],
    chainName: 'Base Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://basescan.org/'],
    blockExplorerApis: ['https://api.basescan.org/'],

    factory: [],

  },

};

export function getDefaultNetworks() {
  return clone(defaultNetworks);
};

export function getWeb3Cfg(folder, getDefault = true) {

  let content = global.localStorage.getItem('ponyHouse-web3');

  try {
    content = JSON.parse(content) ?? {};
  } catch (err) {
    content = {};
  }

  if (getDefault) {

    content.web3Enabled = typeof content.web3Enabled === 'boolean' ? content.web3Enabled : true;
    content.networks = objType(content.networks, 'object') ? content.networks : {};
    for (const item in defaultNetworks) {
      if (!objType(content.networks[item], 'object')) {
        content.networks[item] = clone(defaultNetworks[item]);
      }
    }

  }

  if (typeof folder === 'string' && folder.length > 0) {
    if (typeof content[folder] !== 'undefined') return content[folder];
    return null;
  }

  return content;

};

export function setWeb3Cfg(folder, value) {
  const content = getWeb3Cfg(null, false);
  content[folder] = value;
  global.localStorage.setItem('ponyHouse-web3', JSON.stringify(content));
};

export function deleteWeb3Cfg(folder) {
  const content = getWeb3Cfg(null, false);
  if (typeof content[folder] !== 'undefined') delete content[folder];
  global.localStorage.setItem('ponyHouse-web3', JSON.stringify(content));
};

// Module
const startWeb3 = () => {

  // Tiny Crypto Place
  const tinyCrypto = {

    warn: {},

    connected: false,
    providerConnected: false,
    protocol: null,

    config: Object.freeze({

      // USD Tokens
      usd: {

        dai: {
          ethereum: '0x6b175474e89094c44da98b954eedeac495271d0f',
          polygon: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
          bsc: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'
        },

        usdt: {
          ethereum: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          polygon: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
        },

        usdc: {
          ethereum: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          polygon: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
          bsc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
        }

      },

      // Networks List
      networks: getWeb3Cfg()?.networks ?? {},

    }),

    constants: Object.freeze({
      HexZero: '0x0000000000000000000000000000000000000000000000000000000000000000'
    }),

    call: {},
    get: {},
    contracts: {},

    errors: Object.freeze({
      noWallet: () => new Error('No wallet connected detected.'),
      noProvider: () => new Error('No provider connected detected.'),
    }),

    decimals: Object.freeze({
      0: 'wei',
      3: 'kwei',
      6: 'mwei',
      9: 'gwei',
      12: 'microether',
      15: 'milliether',
      18: 'ether',
      21: 'kether',
      24: 'mether',
      27: 'gether',
      30: 'tether',
    }),

  };

  // Check if Web3 has been injected by the browser (Mist/MetaMask).
  if (typeof ethereum !== 'undefined' && window.ethereum.isMetaMask) {

    // Emitter
    class MyEmitter extends EventEmitter { }
    const myEmitter = new MyEmitter();

    tinyCrypto.on = (where, callback) => myEmitter.on(where, callback);

    tinyCrypto.once = (where, callback) => myEmitter.once(where, callback);

    tinyCrypto.on = Object.freeze(tinyCrypto.on);
    tinyCrypto.once = Object.freeze(tinyCrypto.once);

    // Calls

    // Account Change
    tinyCrypto.call.accountsChanged = (accounts) => new Promise((resolve, reject) => {
      tinyCrypto.get.signerAddress().then(address => {

        tinyCrypto.address = address;
        if (tinyCrypto.address) {

          if (localStorage) {
            localStorage.setItem('web3_address', tinyCrypto.address);
          }

          tinyCrypto.accounts = accounts;
          myEmitter.emit('accountsChanged', accounts);
          resolve(accounts);

        }

      }).catch(reject);

    });

    // Get Signer Address
    tinyCrypto.get.signerAddress = (index = 0) => new Promise((resolve, reject) => {
      tinyCrypto.call.requestAccounts().then(accounts => {

        if (Array.isArray(accounts) && accounts.length > 0 && typeof accounts[index] === 'string') {
          resolve(accounts[index]);
        }

        else {
          resolve(null);
        }

      }).catch(reject);
    });

    // Network Changed
    tinyCrypto.call.networkChanged = (networkId) => {

      tinyCrypto.networkId = networkId;

      if (localStorage) {
        localStorage.setItem('web3_network_id', networkId);
      }

      myEmitter.emit('networkChanged', networkId);

    };

    // Request Account
    tinyCrypto.call.requestAccounts = () => new Promise((resolve, reject) => {
      tinyCrypto.provider.eth.requestAccounts().then(accounts => {

        // Address
        if (Array.isArray(accounts) && accounts.length > 0) {
          for (const item in accounts) {
            accounts[item] = accounts[item].toLowerCase();
          }
        }

        tinyCrypto.accounts = accounts;
        tinyCrypto.connected = true;

        myEmitter.emit('requestAccounts', accounts);
        resolve(accounts);

      }).catch(err => {
        tinyCrypto.connected = false;
        reject(err);
      });
    });

    // Check Connection
    tinyCrypto.call.checkConnection = () => new Promise((resolve, reject) => {
      if (tinyCrypto.providerConnected) {
        tinyCrypto.provider.eth.getAccounts().then(accounts => {

          // Address
          if (Array.isArray(accounts) && accounts.length > 0) {
            for (const item in accounts) {
              accounts[item] = accounts[item].toLowerCase();
            }
          }

          tinyCrypto.accounts = accounts;

          // Check Address
          if (tinyCrypto.existAccounts()) {

            tinyCrypto.get.signerAddress().then(address => {

              tinyCrypto.address = address;

              myEmitter.emit('checkConnection', { address, accounts });
              resolve(address);

            }).catch(reject);

          }

          else {
            resolve(false);
          }

        });
      }
      else {
        reject(tinyCrypto.errors.noProvider());
      }

    });

    // Wait Address
    tinyCrypto.call.waitAddress = () => new Promise((resolve, reject) => {

      try {

        if (tinyCrypto.address) {
          resolve(tinyCrypto.address);
        }

        else {
          setTimeout(() => {
            tinyCrypto.call.waitAddress().then(data => { resolve(data); }).catch(reject);
          }, 500);
        }

      }

      catch (err) { reject(err); }

    });

    // Execute Contract
    tinyCrypto.call.executeContract = (contract, abi, data, gasLimit = 100000) => new Promise((resolve, reject) => {
      if (tinyCrypto.connected) {

        // Loading
        tinyCrypto.get.signerAddress().then(address => {
          tinyCrypto.address = address;
          tinyCrypto.provider.eth.getTransactionCount(address).then(nonce => {
            tinyCrypto.provider.eth.getGasPrice().then(currentGasPrice => {

              // construct the transaction data
              const tx = {

                nonce,
                gasLimit: tinyCrypto.provider.utils.toHex(gasLimit),

                // eslint-disable-next-line radix
                gasPrice: tinyCrypto.provider.utils.toHex(parseInt(currentGasPrice)),

                from: address,
                to: contract,
                value: tinyCrypto.constants.HexZero,
                data: tinyCrypto.provider.eth.abi.encodeFunctionCall(abi, data),

              };

              // Complete
              tinyCrypto.provider.eth.sendTransaction(tx).then(resolve).catch(reject);

            }).catch(reject);
          }).catch(reject);
        }).catch(reject);

      }

      else { reject(tinyCrypto.errors.noWallet()); }

    });

    // Read Contract
    tinyCrypto.call.readContract = (contract, functionName, data, abi) => new Promise((resolve, reject) => {

      if (!tinyCrypto.contracts[contract] && abi) {
        tinyCrypto.contracts[contract] = new tinyCrypto.provider.eth.Contract(abi, contract);
      }

      if (tinyCrypto.contracts[contract]) {
        tinyCrypto.contracts[contract].methods[functionName].apply(tinyCrypto.contracts[contract], data).call().then(resolve).catch(reject);
      }

      else {
        resolve(null);
      }

    });

    // Send Payment
    tinyCrypto.call.sendTransaction = (amount, address, contract = null, gasLimit = 100000) => new Promise((resolve, reject) => {

      if (tinyCrypto.connected) {

        // Result
        tinyCrypto.get.signerAddress().then(mainWallet => {

          // Address
          const tinyAddress = address.toLowerCase();

          // Token Mode
          if (contract) {

            // Contract Value
            let tinyContract = contract;

            // Connect to the contract
            if (typeof tinyContract === 'string') { tinyContract = { value: contract, decimals: 18 }; }
            if (typeof tinyContract.value !== 'string') { tinyContract.value = ''; }
            if (typeof tinyContract.decimals !== 'number') { tinyContract.decimals = 18; }

            // Transaction
            tinyCrypto.call.executeContract(tinyContract.value, {
              type: 'function',
              name: 'transfer',
              stateMutability: 'nonpayable',
              payable: false,
              constant: false,
              outputs: [{ type: 'uint8' }],
              inputs: [{
                name: '_to',
                type: 'address'
              }, {
                name: '_value',
                type: 'uint256'
              }]
            }, [
              tinyAddress,
              tinyCrypto.provider.utils.toWei(String(amount), tinyCrypto.decimals[tinyContract.decimals])
            ], gasLimit).then(resolve).catch(reject);

          }

          // Normal Mode
          else {
            tinyCrypto.provider.eth.sendTransaction({
              from: mainWallet,
              to: tinyAddress,
              value: tinyCrypto.provider.utils.toWei(String(amount)),
            }).then(resolve).catch(reject);
          }

        }).catch(reject);

      }

      else {
        reject(tinyCrypto.errors.noWallet());
      }

    });

    // Sign
    tinyCrypto.call.sign = (msg = '', password = '') => new Promise((resolve, reject) => {

      if (tinyCrypto.connected) {
        tinyCrypto.get.signerAddress().then(address => {

          tinyCrypto.address = address;
          if (address) {
            tinyCrypto.provider.eth.personal.sign(tinyCrypto.provider.utils.utf8ToHex(msg), address, password).then(resolve);
          }

          else {
            resolve(null);
          }

        }).catch(reject);
      }

      else {
        reject(tinyCrypto.errors.noWallet());
      }

    });

    // Data
    tinyCrypto.get.provider = () => tinyCrypto.provider;
    tinyCrypto.get.address = () => tinyCrypto.address;
    tinyCrypto.get.call = () => tinyCrypto.call;
    tinyCrypto.get.config = () => window.clone(tinyCrypto.config);

    // Exist Accounts
    tinyCrypto.existAccounts = () => Array.isArray(tinyCrypto.accounts) && tinyCrypto.accounts.length > 0;

    // Insert Provider
    // eslint-disable-next-line no-undef
    tinyCrypto.provider = new Web3(window.ethereum);
    tinyCrypto.providerConnected = true;

    // Insert Protocol
    tinyCrypto.protocol = 'metamask';

    // Change Account Detector
    window.ethereum.on('accountsChanged', accounts => {
      tinyCrypto.call.accountsChanged(accounts);
    });

    // Network Change
    window.ethereum.on('networkChanged', networkId => {
      tinyCrypto.call.networkChanged(networkId);
    });

    // Ready Provider and check the connection
    tinyCrypto.call.checkConnection().then(() => {
      myEmitter.emit('readyProvider');
    });

  }

  // Freeze
  tinyCrypto.call = Object.freeze(tinyCrypto.call);
  tinyCrypto.get = Object.freeze(tinyCrypto.get);

  tinyCrypto.getCfg = getWeb3Cfg;
  tinyCrypto.setCfg = setWeb3Cfg;
  tinyCrypto.deleteCfg = deleteWeb3Cfg;

  // Insert into global
  global.tinyCrypto = tinyCrypto;

};

// Export Module
export { startWeb3 };
