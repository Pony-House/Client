import { addToDataFolder, getDataList } from '../selectedRoom';

// Emoji (Inactive)
export function isUserEmojiAnimationMuted(userId) {
  const value = getDataList('user_cache', 'muteEmojiAnimation', userId);
  return typeof value === 'boolean' ? value : false;
}

export function muteUserEmojiAnimation(userId, value) {
  addToDataFolder(
    'user_cache',
    'muteEmojiAnimation',
    userId,
    typeof value === 'boolean' ? value : null,
    200,
  );
}

export function isUserEmojiMuted(userId) {
  const value = getDataList('user_cache', 'muteEmoji', userId);
  return typeof value === 'boolean' ? value : false;
}

export function muteUserEmoji(userId, value) {
  addToDataFolder(
    'user_cache',
    'muteEmoji',
    userId,
    typeof value === 'boolean' ? value : null,
    200,
  );
}

// Sticker
export function isUserStickerAnimationMuted(userId) {
  const value = getDataList('user_cache', 'muteStickerAnimation', userId);
  return typeof value === 'boolean' ? value : false;
}

export function muteUserStickerAnimation(userId, value) {
  addToDataFolder(
    'user_cache',
    'muteStickerAnimation',
    userId,
    typeof value === 'boolean' ? value : null,
    200,
  );
}

export function isUserStickerMuted(userId) {
  const value = getDataList('user_cache', 'muteSticker', userId);
  return typeof value === 'boolean' ? value : false;
}

export function muteUserSticker(userId, value) {
  addToDataFolder(
    'user_cache',
    'muteSticker',
    userId,
    typeof value === 'boolean' ? value : null,
    200,
  );
}

// Image and custom emojis
export function isUserImageMuted(userId) {
  const value = getDataList('user_cache', 'muteImage', userId);
  return typeof value === 'boolean' ? value : false;
}

export function muteUserImage(userId, value) {
  addToDataFolder(
    'user_cache',
    'muteImage',
    userId,
    typeof value === 'boolean' ? value : null,
    200,
  );
}

// Embed
export function isUserEmbedMuted(userId) {
  const value = getDataList('user_cache', 'muteEmbed', userId);
  return typeof value === 'boolean' ? value : false;
}

export function muteUserEmbed(userId, value) {
  addToDataFolder(
    'user_cache',
    'muteEmbed',
    userId,
    typeof value === 'boolean' ? value : null,
    200,
  );
}

// Video
export function isUserVideoMuted(userId) {
  const value = getDataList('user_cache', 'muteVideo', userId);
  return typeof value === 'boolean' ? value : false;
}

export function muteUserVideo(userId, value) {
  addToDataFolder(
    'user_cache',
    'muteVideo',
    userId,
    typeof value === 'boolean' ? value : null,
    200,
  );
}
