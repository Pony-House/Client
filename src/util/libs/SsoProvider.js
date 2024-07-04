import EventEmitter from 'events';
import { objType } from 'for-promise/utils/lib.mjs';

import * as auth from '@src/client/action/auth';
import { getBaseUrl, eventMaxListeners } from '../matrixUtil';

// Emitter
class SsoProvider extends EventEmitter {
  constructor() {
    super();
    this.resetAll();
  }

  resetAll() {
    this.searchingHs = null;
    this.serverName = null;
    this.baseUrl = null;
    this.login = null;
    this.register = null;
    this.emit('changeData', this.getData());
    this.resetProviders();
    this.emit('resetData', this.getData(), this.getProviders());
  }

  setSearchingHs(searchingHs) {
    this.searchingHs = searchingHs;
    this.emit('changeSearchingHs', this.searchingHs);
  }

  async fetch(servername, setProcess) {
    const tinyThis = this;
    let baseUrl = null;
    baseUrl = await getBaseUrl(servername);

    if (this.searchingHs !== servername) return;
    if (typeof setProcess === 'function')
      setProcess({ isLoading: true, message: `Connecting to ${baseUrl}...` });
    const tempClient = auth.createTemporaryClient(baseUrl);

    return Promise.allSettled([tempClient.loginFlows(), tempClient.register()])
      .then((values) => {
        const loginFlow = values[0].status === 'fulfilled' ? values[0]?.value : undefined;
        const registerFlow = values[1].status === 'rejected' ? values[1]?.reason?.data : undefined;
        if (loginFlow === undefined || registerFlow === undefined) throw new Error();

        if (tinyThis.searchingHs !== servername) return;
        tinyThis.setData({
          serverName: servername,
          baseUrl,
          login: loginFlow,
          register: registerFlow,
        });

        if (typeof setProcess === 'function') setProcess({ isLoading: false });
        if (
          objType(loginFlow, 'object') &&
          objType(loginFlow.login, 'object') &&
          Array.isArray(loginFlow.login.flows)
        )
          tinyThis.setProviders(loginFlow.login.flows);

        return { data: tinyThis.getData(), providers: tinyThis.getProviders() };
      })
      .catch((err) => {
        if (servername) console.error(err);
        if (tinyThis.searchingHs !== servername) return;
        tinyThis.resetAll();
        if (typeof setProcess === 'function')
          setProcess({
            isLoading: false,
            error: 'Unable to connect. Please check your input.',
          });
      });
  }

  setData(data = { serverName: null, baseUrl: null, login: null, register: null }) {
    this.serverName = data.serverName;
    this.baseUrl = data.baseUrl;
    this.login = data.login;
    this.register = data.register;
    this.emit('changeData', this.getData());
  }

  getData() {
    return {
      serverName: this.serverName,
      baseUrl: this.baseUrl,
      login: this.login,
      register: this.register,
    };
  }

  resetProviders() {
    this._pVanilla = {
      type: 'm.login.sso',
      identity_providers: [],
    };
    this.providers = this._pVanilla.identity_providers;
    this.emit('changeProviders', this.getProviders());
  }

  setProviders(loginFlow) {
    this._pVanilla = loginFlow?.filter((flow) => flow.type === 'm.login.sso')[0];
    this.providers = this._pVanilla.identity_providers;
    this.emit('changeProviders', this.getProviders());
  }

  getProviders() {
    return this.providers;
  }
}

// Export
const ssoProvider = new SsoProvider();
ssoProvider.setMaxListeners(eventMaxListeners);
export default ssoProvider;

// DEV
if (__ENV_APP__.MODE === 'development') {
  global.ssoProvider = ssoProvider;
}
