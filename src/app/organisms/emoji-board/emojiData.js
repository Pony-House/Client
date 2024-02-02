import objectHash from 'object-hash';
import { getRelevantPacks } from './custom-emoji';
import initMatrix from '../../../client/initMatrix';

import { getEmojisList, getStickersList } from './recent';

import {
  addDefaultEmojisToList,
  resetEmojisList,
  addEmojiToList,
  addStickerToList,
  resetStickersList,
} from './emoji';

const ROW_EMOJIS_COUNT = 7;
const ROW_STICKERS_COUNT = 3;

const tinyBoardData = {
  emoji: { recent: [], fav: [], data: [] },
  sticker: { recent: [], fav: [], data: [] },
};

export function getEmojiData(type, recent, fav, data, setRecent, setFav, setData) {
  if (objectHash(tinyBoardData[type].recent) !== objectHash(recent))
    setRecent(tinyBoardData[type].recent);
  if (objectHash(tinyBoardData[type].fav) !== objectHash(fav)) setFav(tinyBoardData[type].fav);
  if (objectHash(tinyBoardData[type].data) !== objectHash(data)) setData(tinyBoardData[type].data);
}

export function loadEmojiData(selectedRoomId) {
  resetEmojisList();
  resetStickersList();

  const mx = initMatrix.matrixClient;
  if (!selectedRoomId) {
    const emojiPacks = getRelevantPacks(mx).filter((pack) => pack.getEmojis().length !== 0);

    // Set an index for each pack so that we know where to jump when the user uses the nav
    for (let i = 0; i < emojiPacks.length; i += 1) {
      emojiPacks[i].packIndex = i;
    }

    tinyBoardData.emoji.data = emojiPacks;

    const stickerPacks = getRelevantPacks(mx).filter((pack) => pack.getStickers().length !== 0);

    // Set an index for each pack so that we know where to jump when the user uses the nav
    for (let i = 0; i < stickerPacks.length; i += 1) {
      stickerPacks[i].packIndex = i;
    }

    tinyBoardData.sticker.data = stickerPacks;
  } else {
    const room = mx.getRoom(selectedRoomId);
    const parentIds = initMatrix.roomList.getAllParentSpaces(room.roomId);
    const parentRooms = [...parentIds].map((id) => mx.getRoom(id));
    if (room) {
      const emojiPacks = getRelevantPacks(room.client, [room, ...parentRooms]).filter(
        (pack) => pack.getEmojis().length !== 0,
      );

      // Set an index for each pack so that we know where to jump when the user uses the nav
      for (let i = 0; i < emojiPacks.length; i += 1) {
        emojiPacks[i].packIndex = i;
      }

      tinyBoardData.emoji.data = emojiPacks;

      const stickerPacks = getRelevantPacks(room.client, [room, ...parentRooms]).filter(
        (pack) => pack.getStickers().length !== 0,
      );

      // Set an index for each pack so that we know where to jump when the user uses the nav
      for (let i = 0; i < stickerPacks.length; i += 1) {
        stickerPacks[i].packIndex = i;
      }

      tinyBoardData.sticker.data = stickerPacks;
    }
  }

  const readPacker = (where, type, addWhereToList) => (pack) => {
    const packItems = pack[type]();
    for (const item in packItems) {
      const emoji = packItems[item];

      addWhereToList({
        isFav: tinyBoardData[where].fav.findIndex((u) => u.mxc === emoji.mxc) > -1,
        group: null,
        hexcode: null,
        label: emoji.shortcode,
        order: null,
        shortcode: emoji.shortcode,
        shortcodes: [emoji.shortcode],
        tags: [emoji.shortcode, 'custom'],
        src: initMatrix.matrixClient.mxcUrlToHttp(emoji.mxc),
        mxc: emoji.mxc,
        unicode: null,
      });
    }
  };

  tinyBoardData.emoji.data.map(readPacker('emoji', 'getEmojis', addEmojiToList));
  tinyBoardData.sticker.data.map(readPacker('sticker', 'getStickers', addStickerToList));
  addDefaultEmojisToList(tinyBoardData.emoji.fav);

  tinyBoardData.emoji.recent = getEmojisList(3 * ROW_EMOJIS_COUNT, 'recent_emoji');
  tinyBoardData.emoji.fav = getEmojisList(3 * ROW_EMOJIS_COUNT, 'fav_emoji');

  tinyBoardData.sticker.recent = getStickersList(3 * ROW_STICKERS_COUNT, 'recent_emoji');
  tinyBoardData.sticker.fav = getStickersList(3 * ROW_STICKERS_COUNT, 'fav_emoji');

  return tinyBoardData;
}

export { ROW_EMOJIS_COUNT, ROW_STICKERS_COUNT };
