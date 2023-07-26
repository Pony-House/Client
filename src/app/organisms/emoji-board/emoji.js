import emojisData from '@emoji-mart/data';
import clone from 'clone';

const emojiGroups = [{
  id: 'people',
  name: 'Smileys & people',
  order: 0,
  emojis: [],
}, {
  id: 'nature',
  name: 'Animals & nature',
  order: 1,
  emojis: [],
}, {
  id: 'foods',
  name: 'Food & drinks',
  order: 2,
  emojis: [],
}, {
  id: 'activity',
  name: 'Activity',
  order: 3,
  emojis: [],
}, {
  id: 'places',
  name: 'Travel & places',
  order: 4,
  emojis: [],
}, {
  id: 'objects',
  name: 'Objects',
  order: 5,
  emojis: [],
}, {
  id: 'symbols',
  name: 'Symbols',
  order: 6,
  emojis: [],
}, {
  id: 'flags',
  name: 'Flags',
  order: 7,
  emojis: [],
}];
Object.freeze(emojiGroups);

const defaultEmojis = [];
emojisData.categories.forEach(category => {
  for (const item in category.emojis) {
    const emoji = emojisData.emojis[category.emojis[item]];
    if (emoji) {

      const em = {
        hexcode: emoji.skins[0].unified.toUpperCase(),
        label: emoji.name,
        unicode: emoji.skins[0].native,
        version: emoji.version,
      };

      em.shortcode = emoji.id;
      em.shortcodes = emoji.id;
      em.tags = clone(emoji.keywords);

      const groupIndex = emojiGroups.findIndex(group => group.id === category.id);
      if (groupIndex > -1) {
        emojiGroups[groupIndex].emojis.push(em);
      };

      defaultEmojis.push(em);

    }
  }
});

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
  emojis, stickers, defaultEmojis, emojiGroups,
  addEmojiToList, removeEmojiFromList, resetEmojisList, addDefaultEmojisToList,
  addStickerToList, removeStickerFromList, resetStickersList,
};
