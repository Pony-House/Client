import { Client } from '@xmtp/xmtp-js';
import EventEmitter from 'events';
import { tinyCrypto } from '.';

class Xmtp extends EventEmitter {
  constructor(mode = 'dev') {
    super();
    this.ready = false;
    this.mode = mode;
  }

  async start() {
    if (__ENV_APP__.WEB3 && tinyCrypto.connected) {
      // this.xmtp = await Client.create(tinyCrypto.provider, { env: this.mode });
      this.ready = true;
      return true;
    }
    return false;
  }

  getXmtp() {
    return this.xmtp;
  }
}

const web3Talk = new Xmtp();
web3Talk.setMaxListeners(Infinity);

if (__ENV_APP__.MODE === 'development') {
  global.web3Talk = web3Talk;
}

export default web3Talk;
