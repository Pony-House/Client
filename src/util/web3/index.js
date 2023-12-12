import { EventEmitter } from 'events';
import clone from 'clone';
import Web3 from 'web3';
import provider from 'eth-provider';
import Web3WsProvider from 'web3-providers-ws';

import { objType } from '../tools';
import startStatus from './status';
import initMatrix from '../../client/initMatrix';
import modWeb3Cfg from '../../../mods/web3';
import moment from '../libs/momentjs';

const tinyCrypto = {};

// Signature Template
const web3SignTemplate = (userId, unix, title = 'Matrix Client - Ethereum Account') => `${title}

user: ${userId}
unix: ${unix || moment().unix()}`;

// Sign user account
export function signUserWeb3Account(unix) {
  return new Promise((resolve, reject) => {

    if (tinyCrypto.call && typeof tinyCrypto.call.sign === 'function') {
      tinyCrypto.call.sign(web3SignTemplate(initMatrix.matrixClient.getUserId(), unix)).then(resolve).catch(reject);
    } else {
      resolve(null);
    }

  });
};

// Validate Account
export function validateWeb3Account(ethereumData, userId) {
  try {

    if (objType(ethereumData, 'object')) {

      // Validator
      if (typeof ethereumData.sign !== 'string') ethereumData.sign = null;
      if (typeof ethereumData.address !== 'string') ethereumData.address = null;
      if (typeof ethereumData.register_time !== 'number') ethereumData.register_time = null;

      if (!objType(ethereumData.btc, 'object')) ethereumData.btc = {};
      if (typeof ethereumData.btc.sign !== 'string') ethereumData.btc.sign = null;
      if (typeof ethereumData.btc.address !== 'string') ethereumData.btc.address = null;

      // Check
      if (ethereumData.sign && ethereumData.address && ethereumData.register_time) {

        // Fix Address
        ethereumData.address = ethereumData.address.toLowerCase();

        // Final Validate
        ethereumData.valid = tinyCrypto.recover(web3SignTemplate(userId, ethereumData.register_time), ethereumData.sign);
        if (typeof ethereumData.valid === 'string') {
          ethereumData.valid = (ethereumData.valid.toLowerCase() === ethereumData.address);
          return ethereumData.valid;
        }

        // Nope
        ethereumData.valid = false;
        return false;

      }

      // Nope
      ethereumData.valid = false;
      return false;

    }

    return false;

  } catch (err) {
    console.error(err);
    return false;
  }
};

// Account
export function getUserWeb3Account(userData, userId) {

  // Get User
  if (!objType(userData, 'object') && typeof userId !== 'string') {

    // Data Base
    const mx = initMatrix.matrixClient;
    const ethereumData = mx.getAccountData('pony.house.ethereum')?.getContent() ?? {};
    if (objType(ethereumData, 'object')) {

      // Validator
      validateWeb3Account(ethereumData, mx.getUserId());
      if (!objType(ethereumData.data, 'object')) ethereumData.data = {};

      // Complete
      return ethereumData;

    }

  }

  // Other User
  else {

    // Validator
    validateWeb3Account(userData, userId);

    // Complete
    return userData;

  }

  // Nothing
  return { sign: null, id: null };

};

export function setUserWeb3Account() {
  return new Promise((resolve, reject) => {
    const now = moment().unix();
    signUserWeb3Account(now).then(sign => {

      const ethereumData = getUserWeb3Account();

      ethereumData.sign = sign;
      ethereumData.address = tinyCrypto.address;
      ethereumData.register_time = now;
      if (typeof ethereumData.valid !== 'undefined') delete ethereumData.valid;

      initMatrix.matrixClient.setAccountData('pony.house.ethereum', ethereumData);
      resolve(ethereumData);

    }).catch(reject);
  });
};

export function resetUserWeb3Account() {
  const ethereumData = { register_time: moment().unix() };
  initMatrix.matrixClient.setAccountData('pony.house.ethereum', ethereumData);
  return ethereumData;
};

export function getDefaultNetworks() {
  return clone(modWeb3Cfg.defaultNetworks);
};

// Config
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
    for (const item in modWeb3Cfg.defaultNetworks) {
      if (!objType(content.networks[item], 'object')) {
        content.networks[item] = clone(modWeb3Cfg.defaultNetworks[item]);
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

// Tiny Crypto Place
tinyCrypto.warn = {};

tinyCrypto.connected = false;
tinyCrypto.providerConnected = false;
tinyCrypto.protocol = null;

tinyCrypto.config = Object.freeze({
  usd: modWeb3Cfg.usd,
  networks: getWeb3Cfg()?.networks ?? {},
});

tinyCrypto.constants = Object.freeze({
  HexZero: '0x0000000000000000000000000000000000000000000000000000000000000000'
});

tinyCrypto.call = {};
tinyCrypto.get = {};
tinyCrypto.contracts = {};

tinyCrypto.errors = Object.freeze({
  noWallet: () => new Error('No wallet connected detected.'),
  noProvider: () => new Error('No provider connected detected.'),
});

tinyCrypto.decimals = Object.freeze({
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
});

// Module
const startWeb3 = () => {

  // Check if Web3 has been injected by the browser (Mist/MetaMask).
  if ((typeof ethereum !== 'undefined' && (window.ethereum.isMetaMask || window.ethereum.isFrame)) || __ENV_APP__.electron_mode) {

    // Checker
    tinyCrypto.existEthereum = () => (typeof window.ethereum !== 'undefined' || __ENV_APP__.electron_mode);
    tinyCrypto.isUnlocked = () => (window.ethereum && window.ethereum._isUnlocked);
    tinyCrypto.existWalletApp = () => (tinyCrypto.existEthereum() && tinyCrypto.isUnlocked());

    // Emitter
    class MyEmitter extends EventEmitter { }
    const myEmitter = new MyEmitter();

    tinyCrypto.on = (where, callback) => myEmitter.on(where, callback);

    tinyCrypto.once = (where, callback) => myEmitter.once(where, callback);

    tinyCrypto.on = Object.freeze(tinyCrypto.on);
    tinyCrypto.once = Object.freeze(tinyCrypto.once);

    tinyCrypto.validateMatrixAddress = () => {
      const userWeb3 = getUserWeb3Account();
      return (userWeb3.valid && tinyCrypto.address === userWeb3.address);
    };

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

          if (tinyCrypto.validateMatrixAddress()) {

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

          } else {
            reject(new Error('INVALID MATRIX ETHEREUM ADDRESS!'));
          }

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

          tinyCrypto.address = mainWallet;

          if (tinyCrypto.validateMatrixAddress()) {

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

          } else {
            reject(new Error('INVALID MATRIX ETHEREUM ADDRESS!'));
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

    // Recover Signature
    tinyCrypto.recover = (msg, sign) => tinyCrypto.provider.eth.accounts.recover(msg, sign);

    // Data
    tinyCrypto.get.provider = () => tinyCrypto.provider;
    tinyCrypto.get.address = () => tinyCrypto.address;
    tinyCrypto.get.call = () => tinyCrypto.call;
    tinyCrypto.get.config = () => window.clone(tinyCrypto.config);

    // Exist Accounts
    tinyCrypto.existAccounts = () => Array.isArray(tinyCrypto.accounts) && tinyCrypto.accounts.length > 0;

    // Insert Provider
    // eslint-disable-next-line no-undef
    if (window.ethereum) {

      tinyCrypto.changeNetwork = (chainId) => window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: tinyCrypto.provider.utils.toHex(chainId) }]
      });

      if (window.ethereum.isMetaMask) {
        tinyCrypto.protocol = 'metamask';
        tinyCrypto.provider = new Web3(window.ethereum);
      } else if (window.ethereum.isFrame) {
        tinyCrypto.protocol = 'frame';
        tinyCrypto.provider = new Web3(provider('frame'));
      }

    }

    // Electron Mode
    else if (__ENV_APP__.electron_mode) {

      tinyCrypto.changeNetwork = (chainId) => tinyCrypto.provider.eth.switchEthereumChain({ chainId: tinyCrypto.provider.utils.toHex(chainId) });

      tinyCrypto.protocol = 'frame';
      tinyCrypto.provider = new Web3(new Web3WsProvider('ws://127.0.0.1:1248', {

        headers: { Origin: __ENV_APP__.info.name },

        clientConfig: {
          maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
          maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
        },

        reconnect: {
          auto: true,
          delay: 5000, // ms
          maxAttempts: 999,
          onTimeout: false
        }

      }));

      tinyCrypto.isUnlocked = () => true;

    }

    // Extend
    tinyCrypto.provider.extend({
      property: 'eth',
      methods: [{
        name: 'switchEthereumChain',
        call: 'wallet_switchEthereumChain',
        params: 1,
        inputFormatter: [{ chainId: tinyCrypto.provider.utils.numberToHex }],
      }]
    });

    /*
    tinyCrypto.provider.extend({
      property: 'eth',
      methods: [{
        name: 'addEthereumChain',
        call: 'wallet_switchEthereumChain',
        params: 1,
        inputFormatter: [{
          chainName: tinyCrypto.provider.utils.toString,
          chainId: tinyCrypto.provider.utils.numberToHex,
          nativeCurrency: { name: tinyCrypto.provider.utils.toString, decimals: tinyCrypto.provider.utils.toNumber, symbol: tinyCrypto.provider.utils.toString },
          rpcUrls: [tinyCrypto.provider.utils.toString]
        }],
      }]
    });
    */

    // Provider Connected
    tinyCrypto.providerConnected = true;

    // Change Account Detector
    if (window.ethereum) {

      window.ethereum.on('accountsChanged', accounts => {
        tinyCrypto.call.accountsChanged(accounts);
      });

      // Network Change
      window.ethereum.on('networkChanged', networkId => {
        tinyCrypto.call.networkChanged(networkId);
      });

    } else {

      tinyCrypto.provider.on('accountsChanged', accounts => {
        tinyCrypto.call.accountsChanged(accounts);
      });

      // Network Change
      tinyCrypto.provider.on('networkChanged', networkId => {
        tinyCrypto.call.networkChanged(networkId);
      });

    }

    // Ready Provider and check the connection
    tinyCrypto.call.checkConnection().then(() => {
      myEmitter.emit('readyProvider');
    });

  }

  // Nothing
  else {
    tinyCrypto.protocol = null;
    tinyCrypto.validateMatrixAddress = () => false;
    tinyCrypto.existEthereum = () => false;
    tinyCrypto.isUnlocked = () => false;
    tinyCrypto.existWalletApp = () => false;
    tinyCrypto.validateMatrixAccount = () => false;
    tinyCrypto.getUser = () => ({ sign: null, id: null });
    tinyCrypto.recover = () => '';
    tinyCrypto.signUserAccount = () => new Promise(resolve => { resolve(null); });
    tinyCrypto.changeNetwork = () => new Promise(resolve => { resolve(null); });
    tinyCrypto.setUser = () => null;
  }

  // Freeze
  tinyCrypto.call = Object.freeze(tinyCrypto.call);
  tinyCrypto.get = Object.freeze(tinyCrypto.get);

  // Functions
  tinyCrypto.getCfg = getWeb3Cfg;
  tinyCrypto.setCfg = setWeb3Cfg;
  tinyCrypto.deleteCfg = deleteWeb3Cfg;

  tinyCrypto.getUser = getUserWeb3Account;
  tinyCrypto.validateMatrixAccount = validateWeb3Account;
  tinyCrypto.signUserAccount = signUserWeb3Account;

  tinyCrypto.setUser = setUserWeb3Account;
  tinyCrypto.resetUser = resetUserWeb3Account;

  // Providers
  tinyCrypto.updateProviders = () => {

    const config = tinyCrypto.getCfg();
    tinyCrypto.networks = config?.networks;

    if (objType(tinyCrypto.userProviders, 'object')) {
      for (const item in tinyCrypto.userProviders) {
        if (typeof tinyCrypto.userProviders[item] !== 'undefined') delete tinyCrypto.userProviders[item];
      }
    }

    tinyCrypto.userProviders = {};

    if (config.web3Enabled && objType(tinyCrypto.networks, 'object')) {
      for (const item in tinyCrypto.networks) {
        if (Array.isArray(tinyCrypto.networks[item].rpcUrls) && typeof tinyCrypto.networks[item].rpcUrls[0] === 'string') {
          tinyCrypto.userProviders[item] = new Web3(tinyCrypto.networks[item].rpcUrls[0]);
        }
      }
    }

  };

  tinyCrypto.updateProviders();

  // Start Status
  startStatus();

};

// Export Module
export { startWeb3, tinyCrypto, web3SignTemplate };
