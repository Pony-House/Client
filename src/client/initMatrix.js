import EventEmitter from 'events';
import * as sdk from 'matrix-js-sdk';
import Olm from '@matrix-org/olm';

import envAPI from '@src/util/libs/env';
import { startTimestamp } from '@src/util/markdown';
import attemptDecryption from '@src/util/libs/attemptDecryption';
import { preloadImages } from '@src/util/tools';
import {
  defaultAvatar,
  defaultProfileBanner,
  defaultSpaceBanner,
} from '@src/app/atoms/avatar/defaultAvatar';

import MatrixVoiceChat from '@src/util/libs/voiceChat';
import { eventMaxListeners } from '@src/util/matrixUtil';

import { secret } from './state/auth';
import RoomList from './state/RoomList';
import AccountData from './state/AccountData';
import RoomsInput from './state/RoomsInput';
import Notifications from './state/Notifications';
import { cryptoCallbacks } from './state/secretStorageKeys';
import navigation from './state/navigation';

global.Olm = Olm;

// eslint-disable-next-line import/no-mutable-exports
const fetchBase = (url, ops) => {
  if (typeof global.nodeFetch === 'function') return global.nodeFetch(url.href, ops);
  return global.fetch(url.href, ops);
};

/* const fetchFn = __ENV_APP__.ELECTRON_MODE
  ? (url, ops) => fetchBase({ href: url }, ops)
  : global.fetch; */
const fetchFn = global.fetch;
export { fetchFn };

const startCustomDNS = () => {
  /* if (__ENV_APP__.ELECTRON_MODE) {
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
  } */
};

class InitMatrix extends EventEmitter {
  constructor() {
    super();
    navigation.initMatrix = this;
    startCustomDNS();
  }

  setMatrixClient(mx) {
    this.matrixClient = mx;
    if (__ENV_APP__.MODE === 'development') {
      global.initMatrix = { matrixClient: mx };
    }
  }

  async init(isGuest = false) {
    startCustomDNS();
    await this.startClient(isGuest);
    this.setupSync();
    this.listenEvents();
    return secret.userId;
  }

  async getAccount3pid() {
    if (this.matrixClient) {
      const res = await fetchFn(
        `${this.matrixClient.baseUrl}/_matrix/client/v3/account/3pid?access_token=${this.matrixClient.getAccessToken()}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const data = await res.json();
      return data;
    }

    return null;
  }

  async startClient(isGuest = false) {
    startCustomDNS();
    startTimestamp();

    const avatarsToLoad = [];
    for (let i = 0; i < 9; i++) {
      avatarsToLoad.push(defaultAvatar(i));
      avatarsToLoad.push(defaultProfileBanner(i));
      avatarsToLoad.push(defaultSpaceBanner(i));
    }

    preloadImages(avatarsToLoad);

    const indexedDBStore = new sdk.IndexedDBStore({
      indexedDB: global.indexedDB,
      localStorage: global.localStorage,
      dbName: 'web-sync-store',
    });

    const clientOps = {
      baseUrl: secret.baseUrl,

      accessToken: secret.accessToken,
      userId: secret.userId,
      store: indexedDBStore,

      cryptoStore: new sdk.IndexedDBCryptoStore(global.indexedDB, 'crypto-store'),

      deviceId: secret.deviceId,

      useE2eForGroupCall: !isGuest,
      isVoipWithNoMediaAllowed: !isGuest,
      timelineSupport: true,
      supportsCallTransfer: !isGuest,

      cryptoCallbacks,
      verificationMethods: ['m.sas.v1'],
    };

    if (__ENV_APP__.ELECTRON_MODE) {
      clientOps.fetchFn = fetchBase;
    }

    this.matrixClient = sdk.createClient(clientOps);
    attemptDecryption.start();
    if (__ENV_APP__.ELECTRON_MODE) {
      if (global.tinyJsonDB && typeof global.tinyJsonDB.startClient === 'function')
        await global.tinyJsonDB.startClient();

      // if (typeof global.startMediaCacheElectron === 'function')
      //  await global.startMediaCacheElectron();
    }

    await envAPI.startDB();
    await indexedDBStore.startup();
    await this.matrixClient.initCrypto();
    this.matrixClient.setMaxListeners(eventMaxListeners);

    await this.matrixClient.startClient({
      lazyLoadMembers: true,
      threadSupport: true,
    });

    this.matrixClient.setGlobalErrorOnUnknownDevices(false);
  }

  setupSync() {
    startCustomDNS();
    const sync = {
      NULL: () => {
        console.log(`NULL state`);
      },
      SYNCING: () => {
        console.log(`SYNCING state`);
      },
      PREPARED: (prevState) => {
        console.log(`PREPARED state`);
        console.log(`Previous state: `, prevState);
        if (__ENV_APP__.MODE === 'development') {
          global.initMatrix = this;
        }
        if (prevState === null) {
          this.roomList = new RoomList(this.matrixClient);
          this.accountData = new AccountData(this.roomList);
          this.roomsInput = new RoomsInput(this.matrixClient, this.roomList);
          this.notifications = new Notifications(this.roomList);
          this.voiceChat = new MatrixVoiceChat(this.matrixClient);

          this.matrixClient.setMaxListeners(eventMaxListeners);
          this.accountData.setMaxListeners(eventMaxListeners);
          this.roomList.setMaxListeners(eventMaxListeners);
          this.roomsInput.setMaxListeners(eventMaxListeners);
          this.notifications.setMaxListeners(eventMaxListeners);

          this.emit('init_loading_finished');
          this.notifications._initNoti();
        } else {
          this.notifications?._initNoti();
        }
      },
      RECONNECTING: () => {
        console.log(`RECONNECTING state`);
      },
      CATCHUP: () => {
        console.log(`CATCHUP state`);
      },
      ERROR: () => {
        console.log(`ERROR state`);
      },
      STOPPED: () => {
        console.log(`STOPPED state`);
      },
    };
    this.matrixClient.on('sync', (state, prevState) => sync[state](prevState));
  }

  listenEvents() {
    startCustomDNS();
    this.matrixClient.on('Session.logged_out', async () => {
      this.matrixClient.stopClient();
      await this.matrixClient.clearStores();
      window.localStorage.clear();
      window.location.reload();
    });
  }

  async logout() {
    startCustomDNS();
    this.matrixClient.stopClient();
    try {
      await this.matrixClient.logout();
    } catch {
      // ignore if failed to logout
    }
    await this.matrixClient.clearStores();
    if (global.tinyJsonDB && typeof global.tinyJsonDB.clearData === 'function')
      await global.tinyJsonDB.clearData();
    window.localStorage.clear();
    window.location.reload();
  }

  clearCacheAndReload() {
    startCustomDNS();
    this.matrixClient.stopClient();
    this.matrixClient.store.deleteAllData().then(() => {
      if (global.tinyJsonDB && typeof global.tinyJsonDB.clearCacheData === 'function') {
        global.tinyJsonDB.clearCacheData().then(() => {
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    });
  }
}

const initMatrix = new InitMatrix();
initMatrix.setMaxListeners(eventMaxListeners);

export default initMatrix;
