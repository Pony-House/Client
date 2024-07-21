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
  getNewEmojiKey(pack, key) {
    if (typeof key !== 'string') return undefined;
    let newKey = key?.replace(/\s/g, '_');
    if (pack.getImages().get(newKey)) {
      newKey = suffixRename(newKey, (suffixedKey) => pack.getImages().get(suffixedKey));
    }
    return newKey;
  }

  // Change Emoji Avatar
  handleEmojiAvatarChange(url, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    pack.setAvatarUrl(url);
    return sendPackContent(pack.getContent());
  }

  // Edit Emoji Profile
  handleEditEmojiProfile(name, attribution, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    pack.setDisplayName(name);
    pack.setAttribution(attribution);
    return sendPackContent(pack.getContent());
  }

  // Emoji Usage Change
  handleEmojiUsageChange(newUsage, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    const usage = [];
    if (newUsage === 'emoticon' || newUsage === 'both') usage.push('emoticon');
    if (newUsage === 'sticker' || newUsage === 'both') usage.push('sticker');
    pack.setUsage(usage);
    pack.getImages().forEach((img) => pack.setImageUsage(img.shortcode, undefined));

    return sendPackContent(pack.getContent());
  }

  // Rename Emoji
  handleRenameEmoji(key, newKeyValue, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    const newKey = this.getNewEmojiKey(pack, newKeyValue);

    if (!newKey || newKey === key) return;
    pack.updateImageKey(key, newKey);

    return sendPackContent(pack.getContent());
  }

  // Delete Emoji
  handleDeleteEmoji(key, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);
    pack.removeImage(key);
    return sendPackContent(pack.getContent());
  }

  // Usage Emoji
  handleUsageEmoji(key, newUsage, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);

    const usage = [];
    if (newUsage === 'emoticon' || newUsage === 'both') usage.push('emoticon');
    if (newUsage === 'sticker' || newUsage === 'both') usage.push('sticker');
    pack.setImageUsage(key, usage);

    return sendPackContent(pack.getContent());
  }

  // Add Emoji
  handleAddEmoji(key, url, roomId, stateKey) {
    const { pack, sendPackContent } = !roomId
      ? this.useUserImagePack(false)
      : this.useRoomImagePack(roomId, stateKey, false);

    const newKey = this.getNewEmojiKey(pack, key);
    if (!newKey || !url) return;

    pack.addImage(newKey, {
      url,
    });

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
