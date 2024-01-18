import { ReceiptType } from 'matrix-js-sdk';
import initMatrix from '../initMatrix';

export async function markAsRead(roomId, threadId) {

  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  if (!room) return;

  const thread = threadId ? room.getThread(threadId) : null;

  initMatrix.notifications.deleteNoti(roomId);

  const userId = mx.getUserId();
  if (!userId) {
    console.warn('Tried to markAsRead without a userId');
    return;
  }

  const timeline = room.getLiveTimeline().getEvents();
  const readEventId = room.getEventReadUpTo(userId);

  const getLatestValidEvent = () => {
    for (let i = timeline.length - 1; i >= 0; i -= 1) {
      const latestEvent = timeline[i];
      if (latestEvent.getId() === readEventId) return null;
      if (!latestEvent.isSending()) return latestEvent;
    }
    return null;
  };

  if (timeline.length === 0) return;
  const latestEvent = getLatestValidEvent();

  if (latestEvent === null) return;

  const content = mx.getAccountData('pony.house.privacy')?.getContent() ?? {};
  const receiptType = typeof content.sendReadReceipts !== 'boolean' || content.sendReadReceipts === true ? ReceiptType.Read : ReceiptType.ReadPrivate;
  await mx.sendReadReceipt(latestEvent, receiptType);

}
