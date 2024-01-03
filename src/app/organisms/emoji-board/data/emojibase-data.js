import emojisData from 'emojibase-data/en/data.json';
import messageData from 'emojibase-data/en/messages.json';
import shortcodesData from 'emojibase-data/en/shortcodes/emojibase.json';
import clone from 'clone';
import { capitalize } from '../../../../util/tools';

const emojiGroups = [];
const emojiCateogoryList = [];

const icons = {
    0: 'fa-solid fa-face-smile',
    1: 'fa-solid fa-person-walking',
    2: 'fa-solid fa-table-cells',
    3: 'fa-solid fa-dog',
    4: 'fa-solid fa-mug-saucer',
    5: 'fa-solid fa-camera',
    6: 'fa-solid fa-futbol',
    7: 'fa-solid fa-building',
    8: 'fa-solid fa-peace',
    9: 'fa-solid fa-flag',
};

for (const item in messageData.groups) {

    emojiGroups.push({
        id: messageData.groups[item].order,
        name: messageData.groups[item].message,
        order: messageData.groups[item].order,
        emojis: [],
    });

    emojiCateogoryList.push([messageData.groups[item].order, icons[messageData.groups[item].order], capitalize(messageData.groups[item].message)]);

}

export { emojiGroups, emojiCateogoryList };

export function installEmojis(defaultEmojis) {

    for (const item in emojisData) {

        const emoji = emojisData[item];
        // if (typeof emoji.version === 'number' && Math.floor(emoji.version) !== 15 && emoji.version !== 2) {

        const shortcodes = Array.isArray(shortcodesData[emoji.hexcode]) ? shortcodesData[emoji.hexcode] : typeof shortcodesData[emoji.hexcode] === 'string' ? [shortcodesData[emoji.hexcode]] : null;

        const em = {
            hexcode: emoji.hexcode.toUpperCase(),
            label: emoji.label,
            unicode: emoji.emoji,
            version: emoji.version,
        };

        em.shortcode = shortcodes[0];
        em.shortcodes = shortcodes;
        em.tags = clone(emoji.tags);

        const groupIndex = emojiGroups.findIndex(group => group.id === emoji.group);
        if (groupIndex > -1) {
            emojiGroups[groupIndex].emojis.push(em);
        };

        defaultEmojis.push(em);

        // }

    }

    Object.freeze(emojiGroups);

};