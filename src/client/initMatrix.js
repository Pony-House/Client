import EventEmitter from 'events';
import * as sdk from 'matrix-js-sdk';
import Olm from '@matrix-org/olm';

import { secret } from './state/auth';
import RoomList from './state/RoomList';
import AccountData from './state/AccountData';
import RoomsInput from './state/RoomsInput';
import Notifications from './state/Notifications';
import { cryptoCallbacks } from './state/secretStorageKeys';
import navigation from './state/navigation';
import logger from './logger';

global.Olm = Olm;

const startCustomDNS = () => {
  if (__ENV_APP__.ELECTRON_MODE) {
    if (typeof global.startCustomDNS === 'function') {
      global.startCustomDNS({

        port: __ENV_APP__.MODE !== 'development' ? __ENV_APP__.CUSTOM_DNS.PORT : __ENV_APP__.CUSTOM_DNS.PORT - 1,
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

class InitMatrix extends EventEmitter {
  constructor() {
    super();
    navigation.initMatrix = this;
    startCustomDNS();
  }

  async init() {
    startCustomDNS();
    await this.startClient();
    this.setupSync();
    this.listenEvents();
  }

  async startClient() {

    startCustomDNS();

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
      timelineSupport: true,
      cryptoCallbacks,
      verificationMethods: [
        'm.sas.v1',
      ],

    };

    if (__ENV_APP__.ELECTRON_MODE) {
      clientOps.fetchFn = (url, ops) => {
        if (typeof global.nodeFetch === 'function') return global.nodeFetch(url.href, ops);
        return global.fetch(url.href, ops);
      };
    }

    this.matrixClient = sdk.createClient(clientOps);

    await indexedDBStore.startup();

    await this.matrixClient.initCrypto();

    await this.matrixClient.startClient({
      lazyLoadMembers: true,
    });

    this.matrixClient.setGlobalErrorOnUnknownDevices(false);

  }

  setupSync() {
    startCustomDNS();
    const sync = {
      NULL: () => {
        logger.log(`NULL state`);
      },
      SYNCING: () => {
        logger.log(`SYNCING state`);
      },
      PREPARED: (prevState) => {
        logger.log(`PREPARED state`);
        logger.log(`Previous state: `, prevState);
        if (__ENV_APP__.MODE === 'development') { global.initMatrix = this; }
        if (prevState === null) {
          this.roomList = new RoomList(this.matrixClient);
          this.accountData = new AccountData(this.roomList);
          this.roomsInput = new RoomsInput(this.matrixClient, this.roomList);
          this.notifications = new Notifications(this.roomList);
          this.emit('init_loading_finished');
          this.notifications._initNoti();
        } else {
          this.notifications?._initNoti();
        }
      },
      RECONNECTING: () => {
        logger.log(`RECONNECTING state`);
      },
      CATCHUP: () => {
        logger.log(`CATCHUP state`);
      },
      ERROR: () => {
        logger.log(`ERROR state`);
      },
      STOPPED: () => {
        logger.log(`STOPPED state`);
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
    window.localStorage.clear();
    window.location.reload();
  }

  clearCacheAndReload() {
    startCustomDNS();
    this.matrixClient.stopClient();
    this.matrixClient.store.deleteAllData().then(() => {
      window.location.reload();
    });
  }
}

const initMatrix = new InitMatrix();

export default initMatrix;
