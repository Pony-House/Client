import { useState, useEffect } from 'react';
import cons from '../../../../client/state/cons';
import initMatrix from '../../../../client/initMatrix';

// Classes
const notificationClasses =
  'position-absolute top-0 start-100 translate-middle badge rounded-pill sidebar-mode';

export { notificationClasses };

// Notification Update
export function useNotificationUpdate() {
  const { notifications } = initMatrix;
  const [, forceUpdate] = useState({});
  useEffect(() => {
    function onNotificationChanged(roomId, threadId, total, prevTotal) {
      if (total === prevTotal) return;
      forceUpdate({});
    }
    notifications.on(cons.events.notifications.NOTI_CHANGED, onNotificationChanged);
    return () => {
      notifications.removeListener(cons.events.notifications.NOTI_CHANGED, onNotificationChanged);
    };
  }, []);
}
