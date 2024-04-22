import initMatrix from '@src/client/initMatrix';
import { objType } from '../tools';

let startedDecrypt = false;
export const startDecryption = () => {
  startedDecrypt = true;
  const mx = initMatrix.matrixClient;

  mx.on('toDeviceEvent', (event) => {
    console.log('[toDeviceEvent]', event.getType());
    console.log('[toDeviceEvent]', event.getContent());
  });
};

const attemptDecryption = (mEvent, ops = undefined, ignoreError = false) =>
  new Promise(async (resolve, reject) => {
    try {
      let result;
      if (!objType(ops, 'object'))
        result = await mEvent.attemptDecryption(initMatrix.matrixClient.getCrypto());
      else result = await mEvent.attemptDecryption(initMatrix.matrixClient.getCrypto(), ops);

      resolve(result);
    } catch (err) {
      if (!ignoreError) reject(err);
      else console.error(err);
    }
  });

export default attemptDecryption;
