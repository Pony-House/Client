import initMatrix from '../../../client/initMatrix';
import { emojis } from './emoji';

const eventType = 'io.element.recent_emoji';

function getRecentEmojisRaw() {
  return initMatrix.matrixClient.getAccountData(eventType)?.getContent().recent_emoji ?? [];
}

export function getRecentEmojis(limit) {
  const res = [];
  getRecentEmojisRaw()
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

export function addRecentEmoji(emojiData) {

  const recent = getRecentEmojisRaw();
  const i = recent.findIndex(([u]) => u && u.isCustom === emojiData.isCustom && u.mxc === emojiData.mxc && u.unicode === emojiData.unicode);

  let entry;

  if (i < 0) {
    entry = [emojiData, 1];
  } else {
    [entry] = recent.splice(i, 1);
    entry[1] += 1;
  }
  recent.unshift(entry);

  initMatrix.matrixClient.setAccountData(eventType, {
    recent_emoji: recent.slice(0, 100),
  });

}
