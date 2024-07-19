import { useState, useEffect } from 'react';
import { ClientEvent } from 'matrix-js-sdk';

import initMatrix from '../../client/initMatrix';
import { hasCrossSigningAccountData } from '../../util/matrixUtil';

export function useCrossSigningStatus() {
  const mx = initMatrix.matrixClient;
  const [isCSEnabled, setIsCSEnabled] = useState(hasCrossSigningAccountData());

  useEffect(() => {
    if (isCSEnabled) return;
    const handleAccountData = (event) => {
      if (event.getType() === 'm.cross_signing.master') {
        setIsCSEnabled(true);
      }
    };

    mx.on(ClientEvent.AccountData, handleAccountData);
    return () => {
      mx.removeListener(ClientEvent.AccountData, handleAccountData);
    };
  }, [isCSEnabled === false]);
  return isCSEnabled;
}
