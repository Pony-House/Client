import initMatrix from '../../../client/initMatrix';
import { emojis } from './emoji';

const eventType = 'io.pony.house.recent_emoji';

function getEmojisListRaw() {
  return initMatrix.matrixClient.getAccountData(eventType)?.getContent() ?? { recent_emoji: [], fav_emoji: [] };
}

export function getEmojisList(limit, where) {
  const res = [];
  getEmojisListRaw()[where]
    .sort((a, b) => b[1] - a[1])
    .find(([emojiData]) => {

      let emoji;

      if (!emojiData.isCustom) {
        emoji = emojis.find((e) => e.unicode === emojiData.unicode);
      } else {
        emoji = emojis.find((e) => e.mxc === emojiData.mxc);
      }

      if (emoji) return res.push(emoji) >= limit;

      return false;

    });
  return res;
}

export function addToEmojiList(emojiData, where) {

  const recent = getEmojisListRaw();
  const i = recent[where].findIndex(([u]) => u && u.isCustom === emojiData.isCustom && u.mxc === emojiData.mxc && u.unicode === emojiData.unicode);

  let entry;

  if (i < 0) {
    entry = [emojiData, 1];
  } else {
    [entry] = recent[where].splice(i, 1);
    entry[1] += 1;
  }
  recent[where].unshift(entry);

  recent[where] = recent[where].slice(0, 100);
  initMatrix.matrixClient.setAccountData(eventType, recent);

}
