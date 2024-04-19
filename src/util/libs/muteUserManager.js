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
    const tinyValue = typeof value === 'boolean' ? value : false;
    addToDataFolder('user_cache', 'muteEmojiAnimation', userId, tinyValue, 200);
    this.emit('muteEmojiAnimation', { value: tinyValue, userId });
    this.emit('mute', { type: 'muteEmojiAnimation', value: tinyValue, userId });
  }

  isEmojiMuted(userId) {
    const value = getDataList('user_cache', 'muteEmoji', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteEmoji(userId, value) {
    const tinyValue = typeof value === 'boolean' ? value : false;
    addToDataFolder('user_cache', 'muteEmoji', userId, tinyValue, 200);
    this.emit('muteEmoji', { value: tinyValue, userId });
    this.emit('mute', { type: 'muteEmoji', value: tinyValue, userId });
  }

  // Sticker Animation (Inactive)
  isStickerAnimationMuted(userId) {
    const value = getDataList('user_cache', 'muteStickerAnimation', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteStickerAnimation(userId, value) {
    const tinyValue = typeof value === 'boolean' ? value : false;
    addToDataFolder('user_cache', 'muteStickerAnimation', userId, tinyValue, 200);
    this.emit('muteStickerAnimation', { value: tinyValue, userId });
    this.emit('mute', { type: 'muteStickerAnimation', value: tinyValue, userId });
  }

  // Sticker
  isStickerMuted(userId) {
    const value = getDataList('user_cache', 'muteSticker', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteSticker(userId, value) {
    const tinyValue = typeof value === 'boolean' ? value : false;
    addToDataFolder('user_cache', 'muteSticker', userId, tinyValue, 200);
    this.emit('muteSticker', { value: tinyValue, userId });
    this.emit('mute', { type: 'muteSticker', value: tinyValue, userId });
  }

  // Image and custom emojis
  isImageMuted(userId) {
    const value = getDataList('user_cache', 'muteImage', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteImage(userId, value) {
    const tinyValue = typeof value === 'boolean' ? value : false;
    addToDataFolder('user_cache', 'muteImage', userId, tinyValue, 200);
    this.emit('muteImage', { value: tinyValue, userId });
    this.emit('mute', { type: 'muteImage', value: tinyValue, userId });
  }

  // Embed
  isEmbedMuted(userId) {
    const value = getDataList('user_cache', 'muteEmbed', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteEmbed(userId, value) {
    const tinyValue = typeof value === 'boolean' ? value : false;
    addToDataFolder('user_cache', 'muteEmbed', userId, tinyValue, 200);
    this.emit('muteEmbed', { value: tinyValue, userId });
    this.emit('mute', { type: 'muteEmbed', value: tinyValue, userId });
  }

  // Reaction
  isReactionMuted(userId) {
    const value = getDataList('user_cache', 'muteReaction', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteReaction(userId, value) {
    const tinyValue = typeof value === 'boolean' ? value : false;
    addToDataFolder('user_cache', 'muteReaction', userId, tinyValue, 200);
    this.emit('muteReaction', { value: tinyValue, userId });
    this.emit('mute', { type: 'muteReaction', value: tinyValue, userId });
  }

  // Video
  isVideoMuted(userId) {
    const value = getDataList('user_cache', 'muteVideo', userId);
    return typeof value === 'boolean' ? value : false;
  }

  muteVideo(userId, value) {
    const tinyValue = typeof value === 'boolean' ? value : false;
    addToDataFolder('user_cache', 'muteVideo', userId, tinyValue, 200);
    this.emit('muteVideo', { value: tinyValue, userId });
    this.emit('mute', { type: 'muteVideo', value: tinyValue, userId });
  }
}

const muteUserManager = new MuteUserManager();
muteUserManager.setMaxListeners(Infinity);
export default muteUserManager;
