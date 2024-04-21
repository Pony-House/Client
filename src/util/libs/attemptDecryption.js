import initMatrix from '@src/client/initMatrix';

const attemptDecryption = (mEvent, ops = {}, ignoreError = false) =>
  new Promise(async (resolve, reject) => {
    try {
      await mEvent.attemptDecryption(initMatrix.matrixClient.getCrypto(), ops);
    } catch (err) {
      if (!ignoreError) reject(err);
      else console.error(err);
    }
  });

export default attemptDecryption;
