import EventEmitter from 'events';
import { objType } from 'for-promise/utils/lib.mjs';

import initMatrix from '@src/client/initMatrix';
import { eventMaxListeners } from '../matrixUtil';

// Emitter
class UserPid extends EventEmitter {
  constructor() {
    super();
    this.vanilla = null;
    this.firstCheck = false;
  }

  async fetch(type = null) {
    const pidData = await initMatrix.getAccount3pid();

    if (
      objType(pidData, 'object') &&
      Array.isArray(pidData.threepids) &&
      pidData.threepids.length > 0
    ) {
      this.vanilla = pidData.threepids;
      this.firstCheck = true;
      for (const item in this.vanilla) {
        this.emit(pidData.threepids[item].medium, pidData.threepids[item]);
      }

      if (typeof type !== 'string') return this.vanilla;
      else return this.getData(type);
    }
    return [];
  }

  getData(type) {
    if (this.firstCheck) return this.vanilla.find((item) => item.medium === type);
    throw new Error('You didn\'t do the first data check using "this.fetch()"!');
  }

  get(type) {
    if (this.firstCheck) return this.getData(type)?.address;
    throw new Error('You didn\'t do the first data check using "this.fetch()"!');
  }
}

// Functions and class
const userPid = new UserPid();
userPid.setMaxListeners(eventMaxListeners);
export default userPid;

if (__ENV_APP__.MODE === 'development') {
  global.userPid = userPid;
}
