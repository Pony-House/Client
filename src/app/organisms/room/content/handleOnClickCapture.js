import { openProfileViewer, openRoomViewer } from '../../../../client/action/navigation';
import navigation from '../../../../client/state/navigation';

const mentionOpen = {
  '@': (userId) => {
    const roomId = navigation.selectedRoomId;
    openProfileViewer(userId, roomId);
  },

  '#': (roomId) => {
    openRoomViewer(initMatrix.roomList.getRoomAliasId(roomId) || roomId, roomId);
  },
};

export default function handleOnClickCapture(e) {
  const { target, nativeEvent } = e;

  const itemId = target.getAttribute('data-mx-pill');
  if (typeof itemId === 'string' && itemId.length > 0) {
    const tag = itemId[0];
    if (typeof mentionOpen[tag] === 'function') mentionOpen[tag](itemId);
  }

  const spoiler = nativeEvent.composedPath().find((el) => el?.hasAttribute?.('data-mx-spoiler'));
  if (spoiler) {
    if (!spoiler.classList.contains('data-mx-spoiler--visible')) e.preventDefault();
    spoiler.classList.toggle('data-mx-spoiler--visible');
  }
}
