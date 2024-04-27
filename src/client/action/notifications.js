import { NotificationCountType, ReceiptType } from 'matrix-js-sdk';
import { checkerFavIcon } from '@src/util/libs/favicon';

import initMatrix from '../initMatrix';
import cons from '../state/cons';

export async function markAsRead(roomId, threadId) {
  const mx = initMatrix.matrixClient;
  const { notifications } = initMatrix;
  const room = mx.getRoom(roomId);
  if (!room) return;

  const thread = threadId ? room.getThread(threadId) : null;
  if (thread) {
    thread.setUnread(NotificationCountType.Total, 0);
    thread.setUnread(NotificationCountType.Highlight, 0);
    initMatrix.notifications.deleteNoti(roomId, threadId);
    notifications.emit(cons.events.notifications.THREAD_NOTIFICATION, thread);
  } else {
    initMatrix.notifications.deleteNoti(roomId);
  }

  const userId = mx.getUserId();
  if (!userId) {
    console.warn('Tried to markAsRead without a userId');
    return;
  }

  const timeline = !thread ? room.getLiveTimeline().getEvents() : thread.timeline;
  const readEventId = !thread ? room.getEventReadUpTo(userId) : thread.getEventReadUpTo(userId);

  const getLatestValidEvent = () => {
    if (!thread) {
      for (let i = timeline.length - 1; i >= 0; i -= 1) {
        const latestEvent = timeline[i];
        if (latestEvent.getId() === readEventId) return null;
        if (!latestEvent.isSending()) return latestEvent;
      }
    } else {
      for (let i = 0; i < timeline.length; i++) {
        const latestEvent = timeline[i];
        if (latestEvent.getId() === readEventId) return null;
        if (!latestEvent.isSending()) return latestEvent;
      }
    }
    return null;
  };

  if (timeline.length === 0) return;
  const latestEvent = getLatestValidEvent();

  if (latestEvent === null) return;

  const content = mx.getAccountData('pony.house.privacy')?.getContent() ?? {};
  const receiptType =
    typeof content.sendReadReceipts !== 'boolean' || content.sendReadReceipts === true
      ? ReceiptType.Read
      : ReceiptType.ReadPrivate;
  await mx.sendReadReceipt(latestEvent, receiptType);
  checkerFavIcon();
}
