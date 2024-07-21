import React, { useMemo } from 'react';
import EventEmitter from 'events';
import initMatrix from '@src/client/initMatrix';
import { ImagePack as ImagePackBuilder } from '@src/app/organisms/emoji-board/custom-emoji';

import { getCurrentState } from '../../matrixUtil';
import { suffixRename } from '../../common';
import { getSelectRoom } from '../../selectedRoom';
import { updateEmojiList } from '@src/client/action/navigation';

// Class Base
class EmojiEditor extends EventEmitter {
  constructor() {
    super();
  }

  // User Image Pack
  useUserImagePack(isReact = true) {
    const mx = initMatrix.matrixClient;
    const packEvent = mx.getAccountData('im.ponies.user_emotes');
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
          .setAccountData('im.ponies.user_emotes', content)
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

    const packEvent = getCurrentState(room).getStateEvents('im.ponies.room_emotes', stateKey);
    const pack = isReact
      ? useMemo(
          () => ImagePackBuilder.parsePack(packEvent.getId(), packEvent.getContent()),
          [room, stateKey],
        )
      : ImagePackBuilder.parsePack(packEvent.getId(), packEvent.getContent());

    const sendPackContent = (content) =>
      new Promise((resolve, reject) =>
        mx
          .sendStateEvent(roomId, 'im.ponies.room_emotes', content, stateKey)
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
  }

  avatarChange(url, roomId, stateKey) {
    _avatarChange(url, roomId, stateKey);
    return sendPackContent(pack.getContent());
  }

  // Edit Emoji Profile
  _editProfile(name, attribution, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    pack.setDisplayName(name);
    pack.setAttribution(attribution);
  }

  editProfile(name, attribution, roomId, stateKey) {
    _editProfile(name, attribution, roomId, stateKey);
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
  }

  usageChange(newUsage, roomId, stateKey) {
    _usageChange(newUsage, roomId, stateKey);
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
  }

  rename(key, newKeyValue, roomId, stateKey) {
    _rename(key, newKeyValue, roomId, stateKey);
    return sendPackContent(pack.getContent());
  }

  // Delete Emoji
  _delete(key, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    pack.removeImage(key);
  }

  delete(key, roomId, stateKey) {
    _delete(key, roomId, stateKey);
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
  }

  usage(key, newUsage, roomId, stateKey) {
    _usage(key, newUsage, roomId, stateKey);
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
  }

  add(key, url, roomId, stateKey) {
    _add(key, url, roomId, stateKey);
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
