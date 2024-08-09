// import { fetchFn } from '../initMatrix';

// History Get
/*
  https://matrix.org/docs/older/matrix-enact/
  https://github.com/benparsons/matrix-enact/blob/master/src/App.js
  https://github.com/matrix-org/matrix-js-sdk/issues/494
  https://matrix-org.github.io/matrix-js-sdk/stable/classes/MatrixClient.html#isGuest
*/
/* loadScriptFromEventId(startEventId, isFirst = true) {
  const url = `${this.matrixClient.baseUrl}/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/context/${encodeURIComponent(startEventId)}?limit=100&access_token=${this.matrixClient.getAccessToken()}`;
  return new Promise((resolve, reject) => {
    fetchFn(url, {
      'Content-Type': 'application/json',
    }).then(res => res.json()).then(data => {

      resolve(data);

    }).catch(reject);
  });
} */
