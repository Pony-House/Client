import { useState, useEffect } from 'react';
import { ClientEvent } from 'matrix-js-sdk';

import initMatrix from '../../client/initMatrix';

export function useAccountData(eventType) {
  const mx = initMatrix.matrixClient;
  const [event, setEvent] = useState(mx.getAccountData(eventType));

  useEffect(() => {
    const handleChange = (mEvent) => {
      if (mEvent.getType() !== eventType) return;
      setEvent(mEvent);
    };
    mx.on(ClientEvent.AccountData, handleChange);
    return () => {
      mx.removeListener(ClientEvent.AccountData, handleChange);
    };
  }, [eventType]);

  return event;
}
