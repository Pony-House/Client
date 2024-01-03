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

const emojiCateogoryList = [
    [0, 'fa-solid fa-face-smile', 'Smilies'],
    [1, 'fa-solid fa-dog', 'Animals'],
    [2, 'fa-solid fa-mug-saucer', 'Food'],
    [3, 'fa-solid fa-futbol', 'Activities'],
    [4, 'fa-solid fa-camera', 'Travel'],
    [5, 'fa-solid fa-building', 'Objects'],
    [6, 'fa-solid fa-peace', 'Symbols'],
    [7, 'fa-solid fa-flag', 'Flags'],
];

export { emojiGroups, emojiCateogoryList };

export function installEmojis(defaultEmojis) {

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

    Object.freeze(emojiGroups);

};