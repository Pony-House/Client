import EventEmitter from 'events';
import { addToDataFolder, getDataList } from '../selectedRoom';

class MuteUserManager extends EventEmitter {
  constructor() {
    super();
  }

  // Emoji (Inactive)
  isEmojiAnimationMuted(userId) {
    const value = getDataList('user_cache', 'muteEmojiAnimation', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteEmojiAnimation(userId, value) {
    addToDataFolder(
      'user_cache',
      'muteEmojiAnimation',
      userId,
      typeof value === 'boolean' ? value : null,
      200,
    );
  }

  isEmojiMuted(userId) {
    const value = getDataList('user_cache', 'muteEmoji', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteEmoji(userId, value) {
    addToDataFolder(
      'user_cache',
      'muteEmoji',
      userId,
      typeof value === 'boolean' ? value : null,
      200,
    );
  }

  // Sticker
  isStickerAnimationMuted(userId) {
    const value = getDataList('user_cache', 'muteStickerAnimation', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteStickerAnimation(userId, value) {
    addToDataFolder(
      'user_cache',
      'muteStickerAnimation',
      userId,
      typeof value === 'boolean' ? value : null,
      200,
    );
  }

  isStickerMuted(userId) {
    const value = getDataList('user_cache', 'muteSticker', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteSticker(userId, value) {
    addToDataFolder(
      'user_cache',
      'muteSticker',
      userId,
      typeof value === 'boolean' ? value : null,
      200,
    );
  }

  // Image and custom emojis
  isImageMuted(userId) {
    const value = getDataList('user_cache', 'muteImage', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteImage(userId, value) {
    addToDataFolder(
      'user_cache',
      'muteImage',
      userId,
      typeof value === 'boolean' ? value : null,
      200,
    );
  }

  // Embed
  isEmbedMuted(userId) {
    const value = getDataList('user_cache', 'muteEmbed', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteEmbed(userId, value) {
    addToDataFolder(
      'user_cache',
      'muteEmbed',
      userId,
      typeof value === 'boolean' ? value : null,
      200,
    );
  }

  // Reaction
  isReactionMuted(userId) {
    const value = getDataList('user_cache', 'muteReaction', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteReaction(userId, value) {
    addToDataFolder(
      'user_cache',
      'muteReaction',
      userId,
      typeof value === 'boolean' ? value : null,
      200,
    );
  }

  // Video
  isVideoMuted(userId) {
    const value = getDataList('user_cache', 'muteVideo', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteVideo(userId, value) {
    addToDataFolder(
      'user_cache',
      'muteVideo',
      userId,
      typeof value === 'boolean' ? value : null,
      200,
    );
  }
}

const muteUserManager = new MuteUserManager();
muteUserManager.setMaxListeners(Infinity);
export default muteUserManager;
