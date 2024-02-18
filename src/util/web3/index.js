import { EventEmitter } from 'events';
import clone from 'clone';

import { ethers } from 'ethers';
import provider from 'eth-provider';
import Web3WsProvider from 'web3-providers-ws';

import moment from '@src/util/libs/momentjs';
import modWeb3Cfg from '@mods/web3';

import { objType } from '../tools';
import startStatus from './status';
import initMatrix from '../../client/initMatrix';

const tinyCrypto = {};
let web3;
tinyCrypto.getWeb3 = () => web3;

// Signature Template
const web3SignTemplate = (userId, unix, title = 'Matrix Client - Ethereum Account') => `${title}

user: ${userId}
unix: ${unix || moment().unix()}`;

// Sign user account
export function signUserWeb3Account(unix) {
  return new Promise((resolve, reject) => {
    if (tinyCrypto.call && typeof tinyCrypto.call.sign === 'function') {
      tinyCrypto.call
        .sign(web3SignTemplate(initMatrix.matrixClient.getUserId(), unix))
        .then(resolve)
        .catch(reject);
    } else {
      resolve(null);
    }
  });
}

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
        ethereumData.valid = tinyCrypto.recover(
          web3SignTemplate(userId, ethereumData.register_time),
          ethereumData.sign,
        );
        if (typeof ethereumData.valid === 'string') {
          ethereumData.valid = ethereumData.valid.toLowerCase() === ethereumData.address;
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
}

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
}

export function setUserWeb3Account() {
  return new Promise((resolve, reject) => {
    const now = moment().unix();
    signUserWeb3Account(now)
      .then((sign) => {
        const ethereumData = getUserWeb3Account();

        ethereumData.sign = sign;
        ethereumData.address = tinyCrypto.address;
        ethereumData.register_time = now;
        if (typeof ethereumData.valid !== 'undefined') delete ethereumData.valid;

        initMatrix.matrixClient.setAccountData('pony.house.ethereum', ethereumData);
        resolve(ethereumData);
      })
      .catch(reject);
  });
}

export function resetUserWeb3Account() {
  const ethereumData = { register_time: moment().unix() };
  initMatrix.matrixClient.setAccountData('pony.house.ethereum', ethereumData);
  return ethereumData;
}

export function getDefaultNetworks() {
  return clone(modWeb3Cfg.defaultNetworks);
}

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

  if (!__ENV_APP__.WEB3) content.web3Enabled = false;
  return content;
}

export function setWeb3Cfg(folder, value) {
  const content = getWeb3Cfg(null, false);
  content[folder] = value;
  global.localStorage.setItem('ponyHouse-web3', JSON.stringify(content));
}

export function deleteWeb3Cfg(folder) {
  const content = getWeb3Cfg(null, false);
  if (typeof content[folder] !== 'undefined') delete content[folder];
  global.localStorage.setItem('ponyHouse-web3', JSON.stringify(content));
}

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
  HexZero: '0x0000000000000000000000000000000000000000000000000000000000000000',
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
const startWeb3 = (tcall) => {
  // Check if Web3 has been injected by the browser (Mist/MetaMask).
  if (
    __ENV_APP__.WEB3 &&
    ((typeof ethereum !== 'undefined' && (window.ethereum.isMetaMask || window.ethereum.isFrame)) ||
      __ENV_APP__.ELECTRON_MODE)
  ) {
    // Checker
    tinyCrypto.existEthereum = () =>
      typeof window.ethereum !== 'undefined' || __ENV_APP__.ELECTRON_MODE;
    tinyCrypto.isUnlocked = () => window.ethereum && window.ethereum._isUnlocked;
    tinyCrypto.existWalletApp = () => tinyCrypto.existEthereum() && tinyCrypto.isUnlocked();

    // Emitter
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.setMaxListeners(Infinity);

    tinyCrypto.on = (where, callback) => myEmitter.on(where, callback);

    tinyCrypto.once = (where, callback) => myEmitter.once(where, callback);

    tinyCrypto.on = Object.freeze(tinyCrypto.on);
    tinyCrypto.once = Object.freeze(tinyCrypto.once);

    tinyCrypto.validateMatrixAddress = () => {
      const userWeb3 = getUserWeb3Account();
      return userWeb3.valid && tinyCrypto.address === userWeb3.address;
    };

    // Network Changed
    tinyCrypto.call.networkChanged = (networkId) => {
      tinyCrypto.networkId = networkId;

      if (localStorage) {
        localStorage.setItem('web3_network_id', networkId);
      }

      myEmitter.emit('networkChanged', networkId);
    };

    // Check Connection
    tinyCrypto.call.checkConnection = () =>
      new Promise((resolve, reject) => {
        if (tinyCrypto.providerConnected) {
          web3
            .send('eth_requestAccounts', [])
            .then(() => {
              web3
                .getSigner()
                .then((signer) => signer.getAddress())
                .then((address) => {
                  tinyCrypto.address = address.toLowerCase();

                  myEmitter.emit('checkConnection', { address });
                  resolve(address);
                })
                .catch(reject);
            })
            .catch(reject);
        } else {
          reject(tinyCrypto.errors.noProvider());
        }
      });

    // Execute Contract
    tinyCrypto.call.executeContract = (contract, abi, data, gasLimit = 100000) =>
      new Promise((resolve, reject) => {
        if (tinyCrypto.connected) {
          // Loading
          tinyCrypto.call
            .checkConnection()
            .then((address) => {
              tinyCrypto.address = address.toLowerCase();

              if (tinyCrypto.validateMatrixAddress()) {
                web3.eth
                  .getTransactionCount(address)
                  .then((nonce) => {
                    web3.eth
                      .getGasPrice()
                      .then((currentGasPrice) => {
                        // construct the transaction data
                        const tx = {
                          nonce,
                          gasLimit: ethers.toBeHex(gasLimit),

                          // eslint-disable-next-line radix
                          gasPrice: ethers.toBeHex(parseInt(currentGasPrice)),

                          from: address,
                          to: contract,
                          value: tinyCrypto.constants.HexZero,
                          data: web3.eth.abi.encodeFunctionCall(abi, data),
                        };

                        // Complete
                        web3.broadcastTransaction(tx).then(resolve).catch(reject);
                      })
                      .catch(reject);
                  })
                  .catch(reject);
              } else {
                reject(new Error('INVALID MATRIX ETHEREUM ADDRESS!'));
              }
            })
            .catch(reject);
        } else {
          reject(tinyCrypto.errors.noWallet());
        }
      });

    // Send Payment
    tinyCrypto.call.sendTransaction = (amount, address, contract = null, gasLimit = 100000) =>
      new Promise((resolve, reject) => {
        if (tinyCrypto.connected) {
          // Result
          tinyCrypto.call
            .checkConnection()
            .then((mainWallet) => {
              tinyCrypto.address = mainWallet.toLowerCase();

              if (tinyCrypto.validateMatrixAddress()) {
                // Address
                const tinyAddress = address.toLowerCase();

                // Token Mode
                if (contract) {
                  // Contract Value
                  let tinyContract = contract;

                  // Connect to the contract
                  if (typeof tinyContract === 'string') {
                    tinyContract = { value: contract, decimals: 18 };
                  }
                  if (typeof tinyContract.value !== 'string') {
                    tinyContract.value = '';
                  }
                  if (typeof tinyContract.decimals !== 'number') {
                    tinyContract.decimals = 18;
                  }

                  // Transaction
                  tinyCrypto.call
                    .executeContract(
                      tinyContract.value,
                      {
                        type: 'function',
                        name: 'transfer',
                        stateMutability: 'nonpayable',
                        payable: false,
                        constant: false,
                        outputs: [{ type: 'uint8' }],
                        inputs: [
                          {
                            name: '_to',
                            type: 'address',
                          },
                          {
                            name: '_value',
                            type: 'uint256',
                          },
                        ],
                      },
                      [
                        tinyAddress,
                        ethers.parseUnits(
                          String(amount),
                          tinyCrypto.decimals[tinyContract.decimals],
                        ),
                      ],
                      gasLimit,
                    )
                    .then(resolve)
                    .catch(reject);
                }

                // Normal Mode
                else {
                  web3.eth
                    .sendTransaction({
                      from: mainWallet,
                      to: tinyAddress,
                      value: ethers.parseUnits(String(amount)),
                    })
                    .then(resolve)
                    .catch(reject);
                }
              } else {
                reject(new Error('INVALID MATRIX ETHEREUM ADDRESS!'));
              }
            })
            .catch(reject);
        } else {
          reject(tinyCrypto.errors.noWallet());
        }
      });

    // Sign
    tinyCrypto.call.sign = (msg = '') =>
      new Promise((resolve, reject) => {
        if (tinyCrypto.connected) {
          web3
            .getSigner()
            .then((signer) => signer.signMessage(msg))
            .then(resolve)
            .catch(reject);
        } else {
          reject(tinyCrypto.errors.noWallet());
        }
      });

    // Recover Signature
    tinyCrypto.recover = (msg, sig) => ethers.recoverAddress(ethers.hashMessage(msg), sig);

    // Data
    tinyCrypto.get.provider = () => web3;
    tinyCrypto.get.address = () => tinyCrypto.address;
    tinyCrypto.get.call = () => tinyCrypto.call;
    tinyCrypto.get.config = () => window.clone(tinyCrypto.config);

    // Exist Accounts
    tinyCrypto.existAccounts = () =>
      typeof tinyCrypto.address === 'string' && tinyCrypto.address.length > 0;

    // Insert Provider
    // eslint-disable-next-line no-undef
    if (window.ethereum) {
      tinyCrypto.changeNetwork = (chainId) =>
        window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.toBeHex(chainId) }],
        });

      if (window.ethereum.isMetaMask) {
        tinyCrypto.protocol = 'metamask';
        web3 = new ethers.BrowserProvider(window.ethereum);
      } else if (window.ethereum.isFrame) {
        tinyCrypto.protocol = 'frame';
        web3 = new ethers.BrowserProvider(provider('frame'));
      }
    }

    // Electron Mode
    else if (__ENV_APP__.ELECTRON_MODE) {
      tinyCrypto.changeNetwork = (chainId) =>
        web3.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.toBeHex(chainId) }],
        });

      tinyCrypto.protocol = 'frame';
      web3 = new ethers.WebSocketProvider(
        new Web3WsProvider('ws://127.0.0.1:1248', {
          headers: { Origin: __ENV_APP__.INFO.name },

          clientConfig: {
            maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
            maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
          },

          reconnect: {
            auto: true,
            delay: 5000, // ms
            maxAttempts: 999,
            onTimeout: false,
          },
        }),
      );

      tinyCrypto.isUnlocked = () => true;
    }

    // Provider Connected
    tinyCrypto.providerConnected = true;

    // Change Account Detector
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => tinyCrypto.call.checkConnection());

      // Network Change
      window.ethereum.on('networkChanged', (networkId) => {
        tinyCrypto.call.networkChanged(networkId);
      });
    } else {
      web3.on('accountsChanged', () => tinyCrypto.call.checkConnection());

      // Network Change
      web3.on('network', (networkId) => {
        tinyCrypto.call.networkChanged(networkId);
      });
    }

    // Ready Provider and check the connection
    tinyCrypto.call
      .checkConnection(true)
      .then(() => {
        tinyCrypto.connected = true;
        myEmitter.emit('readyProvider');
      })
      .catch((err) => {
        console.error(err);
        alert(err.message);
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
    tinyCrypto.signUserAccount = () =>
      new Promise((resolve) => {
        resolve(null);
      });
    tinyCrypto.changeNetwork = () =>
      new Promise((resolve) => {
        resolve(null);
      });
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
        if (typeof tinyCrypto.userProviders[item] !== 'undefined')
          delete tinyCrypto.userProviders[item];
      }
    }

    tinyCrypto.userProviders = {};

    if (config.web3Enabled && objType(tinyCrypto.networks, 'object')) {
      for (const item in tinyCrypto.networks) {
        if (
          Array.isArray(tinyCrypto.networks[item].rpcUrls) &&
          typeof tinyCrypto.networks[item].rpcUrls[0] === 'string'
        ) {
          tinyCrypto.userProviders[item] = new ethers.JsonRpcProvider(
            tinyCrypto.networks[item].rpcUrls[0],
          );
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

if (__ENV_APP__.MODE === 'development') {
  global.tinyCrypto = tinyCrypto;
  global.ethers = ethers;
}
