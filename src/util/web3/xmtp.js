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
    if (__ENV_APP__.WEB3 && tinyCrypto.connected && !this.ready) {

      try {
        const signer = await tinyCrypto.getWeb3().getSigner();
        this.xmtp = await Client.create(signer, { env: this.mode });
        this.ready = true;
      } catch (err) {
        this.ready = false;
        console.error(err);
      }

      return this.ready;

    }
    return false;
  }

  getXmtp() {
    if (this.ready) return this.xmtp;
    return null;
  }
}

// const web3Talk = new Xmtp('production');
const web3Talk = new Xmtp();
web3Talk.setMaxListeners(Infinity);

if (__ENV_APP__.MODE === 'development') {
  global.web3Talk = web3Talk;
}

export default web3Talk;
