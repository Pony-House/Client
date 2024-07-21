import React, { useMemo } from 'react';
import EventEmitter from 'events';
import { ClientEvent, RoomStateEvent } from 'matrix-js-sdk';

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

  getPersonal() {
    if (objType(this.personalPack, 'object')) return this.personalPack;
    return null;
  }

  getRoom(roomId, stateKey) {
    if (objType(this.roomsPack[roomId], 'object') && this.roomsPack[roomId][stateKey])
      return this.roomsPack[roomId][stateKey];
    return null;
  }

  // Start events
  start() {
    const mx = initMatrix.matrixClient;
    const tinyThis = this;

    mx.addListener(ClientEvent.AccountData, (event) => {
      if (event.getType() !== EmojiEvents.UserEmotes) return;
      console.log('[matrix-emoji-editor] [personal-emojis] Updated!');
      tinyThis.personalPack = tinyThis.useUserImagePack(false);
      tinyThis.emit('personalUpdated', tinyThis.personalPack);
    });

    mx.on(RoomStateEvent.Events, (event) => {
      if (event.getType() !== EmojiEvents.RoomEmotes) return;
      const roomId = event.getRoomId();
      const stateKey = event.getStateKey();
      if (roomId && stateKey) {
        console.log('[matrix-emoji-editor] [room-emojis] Updated!', roomId, stateKey);

        if (!tinyThis.roomsPack[roomId]) tinyThis.roomsPack[roomId] = {};
        tinyThis.roomsPack[roomId][stateKey] = tinyThis.useRoomImagePack(
          roomId,
          stateKey,
          event,
          false,
        );

        tinyThis.emit('roomUpdated', tinyThis.roomsPack[roomId][stateKey], roomId, stateKey);
      }
    });

    mx.addListener(ClientEvent.DeleteRoom, (roomId) => {
      delete tinyThis.roomsPack[roomId];
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
  useRoomImagePack(roomId, stateKey, definedPackEvent = null, isReact = true) {
    const mx = initMatrix.matrixClient;
    const room = mx.getRoom(roomId);
    if (definedPackEvent || room) {
      const packEvent =
        definedPackEvent || getCurrentState(room).getStateEvents(EmojiEvents.RoomEmotes, stateKey);

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
      : this.useRoomImagePack(roomId, stateKey, null, false);
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
      : this.useRoomImagePack(roomId, stateKey, null, false);
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
      : this.useRoomImagePack(roomId, stateKey, null, false);
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
      : this.useRoomImagePack(roomId, stateKey, null, false);
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
      : this.useRoomImagePack(roomId, stateKey, null, false);
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
      : this.useRoomImagePack(roomId, stateKey, null, false);

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
      : this.useRoomImagePack(roomId, stateKey, null, false);

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
