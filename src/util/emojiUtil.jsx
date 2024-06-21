import React, { useMemo } from 'react';
import JSZip from 'jszip';

import initMatrix from '@src/client/initMatrix';

import { getCurrentState } from './matrixUtil';
import { ImagePack as ImagePackBuilder } from '@src/app/organisms/emoji-board/custom-emoji';

export function useUserImagePack() {
  const mx = initMatrix.matrixClient;
  const packEvent = mx.getAccountData('im.ponies.user_emotes');
  const pack = useMemo(
    () =>
      ImagePackBuilder.parsePack(
        mx.getUserId(),
        packEvent?.getContent() ?? {
          pack: { display_name: 'Personal' },
          images: {},
        },
      ),
    [],
  );

  const sendPackContent = (content) => {
    mx.setAccountData('im.ponies.user_emotes', content).then(() =>
      updateEmojiList(getSelectRoom()),
    );
  };

  return {
    pack,
    sendPackContent,
  };
}

export function useRoomImagePack(roomId, stateKey) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);

  const packEvent = getCurrentState(room).getStateEvents('im.ponies.room_emotes', stateKey);
  const pack = useMemo(
    () => ImagePackBuilder.parsePack(packEvent.getId(), packEvent.getContent()),
    [room, stateKey],
  );

  const sendPackContent = (content) => {
    mx.sendStateEvent(roomId, 'im.ponies.room_emotes', content, stateKey).then(() =>
      updateEmojiList(roomId),
    );
  };

  return {
    pack,
    sendPackContent,
  };
}

export function getEmojiUsage(usage) {
  if (usage.includes('emoticon') && usage.includes('sticker')) return 'both';
  if (usage.includes('emoticon')) return 'emoticon';
  if (usage.includes('sticker')) return 'sticker';

  return 'both';
}

// Global Pack
export function addGlobalImagePack(roomId, stateKey) {
  const mx = initMatrix.matrixClient;
  const content = mx.getAccountData('im.ponies.emote_rooms')?.getContent() ?? {};
  if (!content.rooms) content.rooms = {};
  if (!content.rooms[roomId]) content.rooms[roomId] = {};
  content.rooms[roomId][stateKey] = {};
  return mx.setAccountData('im.ponies.emote_rooms', content);
}
export function removeGlobalImagePack(roomId, stateKey) {
  const mx = initMatrix.matrixClient;
  const content = mx.getAccountData('im.ponies.emote_rooms')?.getContent() ?? {};
  if (!content.rooms) return Promise.resolve();
  if (!content.rooms[roomId]) return Promise.resolve();
  delete content.rooms[roomId][stateKey];
  if (Object.keys(content.rooms[roomId]).length === 0) {
    delete content.rooms[roomId];
  }
  return mx.setAccountData('im.ponies.emote_rooms', content);
}

export function isGlobalPack(roomId, stateKey) {
  const mx = initMatrix.matrixClient;
  const globalContent = mx.getAccountData('im.ponies.emote_rooms')?.getContent();
  if (typeof globalContent !== 'object') return false;

  const { rooms } = globalContent;
  if (typeof rooms !== 'object') return false;

  return rooms[roomId]?.[stateKey] !== undefined;
}

// Export Emoji
export function emojiExport(images) {
  try {
    const zip = new JSZip();
    const mx = initMatrix.matrixClient;

    console.log('Export Emojis', images);
    images.map(([shortcode, image]) => {
      const fileUrl = new URL(mx.mxcUrlToHttp(image.mxc));
      const jsonData = {
        mxc: image.mxc,
        shortcode,
        usage: getEmojiUsage(image.usage),
      };

      console.log(fileUrl, jsonData);
    });
  } catch (err) {
    console.error(err);
    alert(err.message, 'Emoji Export Error');
  }
}
