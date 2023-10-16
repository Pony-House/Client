
export function updateName(room) {

    // Separe Channel Name
    const name = room.name.split(' - ');
    if (name.length > 0) {

        // Index Channel
        const index = Number(name[0]);
        if (typeof index === 'number' && !Number.isNaN(index)) {

            // New Data
            const newData = { original: room.name, index };

            // New Category
            if (name.length > 2) {

                if (typeof name[1] === 'string' && name[1].length > 0) {
                    newData.category = name[1];
                }

                name.shift();

            }

            // Space
            name.shift();

            // Insert Name
            room.nameCinny = newData;
            room.name = name.join(' - ');

        }

    }

    return room;

}

export function sortName(a, b) {

    if (a.nameCinny && b.nameCinny) {
        return a.nameCinny.index - b.nameCinny.index;
    }

    const nameA = a.name.toUpperCase(); // ignore upper and lowercase
    const nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }

    // names must be equal
    return 0;

}

const sortTimeTemplate = (item) => Array.isArray(item.timeline) && item.timeline.length > 0 ? item.timeline[item.timeline.length - 1] : 0;
export function sortTime(a, b) {
    return sortTimeTemplate(a) - sortTimeTemplate(b);
} 