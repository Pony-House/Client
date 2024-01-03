import { installEmojis } from './data/emojibase-data';

const defaultEmojis = [];
installEmojis(defaultEmojis);
const emojis = [];

const addEmojiToList = data => {
  emojis.push(data);
};

const removeEmojiFromList = data => {
  const index = emojis.indexOf(data);
  if (index > -1) {
    emojis.splice(index, 1);
  }
};

const resetEmojisList = () => {
  while (emojis.length > 0) {
    emojis.shift();
  }
};

const addDefaultEmojisToList = (favEmojis = []) => {
  defaultEmojis.map(emoji => {
    emoji.isFav = (favEmojis.findIndex(u => u.unicode === emoji.unicode) > -1);
    emojis.push(emoji);
    return emoji;
  });
};

const stickers = [];

const addStickerToList = data => {
  stickers.push(data);
};

const removeStickerFromList = data => {
  const index = stickers.indexOf(data);
  if (index > -1) {
    stickers.splice(index, 1);
  }
};

const resetStickersList = () => {
  while (stickers.length > 0) {
    stickers.shift();
  }
};

export {
  emojis, stickers, defaultEmojis,
  addEmojiToList, removeEmojiFromList, resetEmojisList, addDefaultEmojisToList,
  addStickerToList, removeStickerFromList, resetStickersList,
};
