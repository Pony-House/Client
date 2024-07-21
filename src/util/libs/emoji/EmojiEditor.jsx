import React, { useMemo } from 'react';
import EventEmitter from 'events';
import { ClientEvent } from 'matrix-js-sdk';

import { objType } from 'for-promise/utils/lib.mjs';

import initMatrix from '@src/client/initMatrix';
import { ImagePack as ImagePackBuilder } from '@src/app/organisms/emoji-board/custom-emoji';

import { getCurrentState } from '../../matrixUtil';
import { suffixRename } from '../../common';
import { getSelectRoom } from '../../selectedRoom';
import { updateEmojiList } from '@src/client/action/navigation';
import EmojiEvents from './EmojiEvents';

// Class Base
class EmojiEditor extends EventEmitter {
  constructor() {
    super();
    this.personalPack = null;
    this.roomsPack = {};
  }

  // Is Emoji Event
  isEmojiEvent(event) {
    const eventType = event.getType();
    return eventType === EmojiEvents.EmoteRooms || eventType === EmojiEvents.UserEmotes;
  }

  // Start events
  start() {
    const mx = initMatrix.matrixClient;
    const tinyThis = this;
    mx.addListener(ClientEvent.AccountData, (event) => {
      const eventType = event.getType();

      // Personal emojis
      if (eventType === EmojiEvents.UserEmotes)
        tinyThis.personalPack = tinyThis.useUserImagePack(false);
      // Room emojis
      else if (eventType === EmojiEvents.EmoteRooms) {
        const content = event.getContent();
        if (objType(content, 'object') && objType(content.rooms, 'object')) {
          for (const roomId in content.rooms) {
            for (const stateKey in content.rooms[roomId]) {
              if (!tinyThis.roomsPack[roomId]) tinyThis.roomsPack[roomId] = {};
              tinyThis.roomsPack[roomId][stateKey] = tinyThis.useRoomImagePack(
                roomId,
                stateKey,
                false,
              );
            }
          }
        }
      }
    });

    mx.addListener(ClientEvent.DeleteRoom, (roomId) => {
      delete tinyThis.roomsPack[roomId];
    });

    mx.addListener(ClientEvent.Room, (room) => {
      console.log(room);
    });
  }

  // User Image Pack
  useUserImagePack(isReact = true) {
    const mx = initMatrix.matrixClient;
    const packEvent = mx.getAccountData(EmojiEvents.UserEmotes);
    const pack = isReact
      ? useMemo(
          () =>
            ImagePackBuilder.parsePack(
              mx.getUserId(),
              packEvent?.getContent() ?? {
                pack: { display_name: 'Personal' },
                images: {},
              },
            ),
          [],
        )
      : ImagePackBuilder.parsePack(
          mx.getUserId(),
          packEvent?.getContent() ?? {
            pack: { display_name: 'Personal' },
            images: {},
          },
        );

    const sendPackContent = (content) =>
      new Promise((resolve, reject) =>
        mx
          .setAccountData(EmojiEvents.UserEmotes, content)
          .then(() => {
            updateEmojiList(getSelectRoom());
            resolve(true);
          })
          .catch(reject),
      );

    return {
      pack,
      sendPackContent,
    };
  }

  // Room Image Pack
  useRoomImagePack(roomId, stateKey, isReact = true) {
    const mx = initMatrix.matrixClient;
    const room = mx.getRoom(roomId);
    if (room) {
      const packEvent = getCurrentState(room).getStateEvents(EmojiEvents.RoomEmotes, stateKey);
      if (packEvent) {
        const pack = isReact
          ? useMemo(
              () => ImagePackBuilder.parsePack(packEvent.getId(), packEvent.getContent()),
              [room, stateKey],
            )
          : ImagePackBuilder.parsePack(packEvent.getId(), packEvent.getContent());

        const sendPackContent = (content) =>
          new Promise((resolve, reject) =>
            mx
              .sendStateEvent(roomId, EmojiEvents.RoomEmotes, content, stateKey)
              .then(() => {
                updateEmojiList(roomId);
                resolve(true);
              })
              .catch(reject),
          );

        return {
          pack,
          sendPackContent,
        };
      }
    }
    return null;
  }

  // Get new emoji key
  _getNewKey(pack, key) {
    if (typeof key !== 'string') return undefined;
    let newKey = key?.replace(/\s/g, '_');
    if (pack.getImages().get(newKey)) {
      newKey = suffixRename(newKey, (suffixedKey) => pack.getImages().get(suffixedKey));
    }
    return newKey;
  }

  // Change Emoji Avatar
  _avatarChange(url, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    pack.setAvatarUrl(url);
    return { pack, sendPackContent };
  }

  avatarChange(url, roomId, stateKey) {
    const { pack, sendPackContent } = this._avatarChange(url, roomId, stateKey);
    return sendPackContent(pack.getContent());
  }

  // Edit Emoji Profile
  _editProfile(name, attribution, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    pack.setDisplayName(name);
    pack.setAttribution(attribution);
    return { pack, sendPackContent };
  }

  editProfile(name, attribution, roomId, stateKey) {
    const { pack, sendPackContent } = this._editProfile(name, attribution, roomId, stateKey);
    return sendPackContent(pack.getContent());
  }

  // Emoji Usage Change
  _usageChange(newUsage, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    const usage = [];
    if (newUsage === 'emoticon' || newUsage === 'both') usage.push('emoticon');
    if (newUsage === 'sticker' || newUsage === 'both') usage.push('sticker');
    pack.setUsage(usage);
    pack.getImages().forEach((img) => pack.setImageUsage(img.shortcode, undefined));
    return { pack, sendPackContent };
  }

  usageChange(newUsage, roomId, stateKey) {
    const { pack, sendPackContent } = this._usageChange(newUsage, roomId, stateKey);
    return sendPackContent(pack.getContent());
  }

  // Rename Emoji
  _rename(key, newKeyValue, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    const newKey = this._getNewKey(pack, newKeyValue);

    if (!newKey || newKey === key) return;
    pack.updateImageKey(key, newKey);
    return { pack, sendPackContent };
  }

  rename(key, newKeyValue, roomId, stateKey) {
    const { pack, sendPackContent } = this._rename(key, newKeyValue, roomId, stateKey);
    return sendPackContent(pack.getContent());
  }

  // Delete Emoji
  _delete(key, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    pack.removeImage(key);
    return { pack, sendPackContent };
  }

  delete(key, roomId, stateKey) {
    const { pack, sendPackContent } = this._delete(key, roomId, stateKey);
    return sendPackContent(pack.getContent());
  }

  // Usage Emoji
  _usage(key, newUsage, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);

    const usage = [];
    if (newUsage === 'emoticon' || newUsage === 'both') usage.push('emoticon');
    if (newUsage === 'sticker' || newUsage === 'both') usage.push('sticker');
    pack.setImageUsage(key, usage);
    return { pack, sendPackContent };
  }

  usage(key, newUsage, roomId, stateKey) {
    const { pack, sendPackContent } = this._usage(key, newUsage, roomId, stateKey);
    return sendPackContent(pack.getContent());
  }

  // Add Emoji
  _add(key, url, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);

    const newKey = this._getNewKey(pack, key);
    if (!newKey || !url) return;

    pack.addImage(newKey, {
      url,
    });
    return { pack, sendPackContent };
  }

  add(key, url, roomId, stateKey) {
    const { pack, sendPackContent } = this._add(key, url, roomId, stateKey);
    return sendPackContent(pack.getContent());
  }
}

// Functions and class
const emojiEditor = new EmojiEditor();
emojiEditor.setMaxListeners(__ENV_APP__.MAX_LISTENERS);
export default emojiEditor;

if (__ENV_APP__.MODE === 'development') {
  global.emojiEditor = emojiEditor;
}
