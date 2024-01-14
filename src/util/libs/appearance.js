export function getAppearance(folder, getDefault = true) {

    let content = global.localStorage.getItem('ponyHouse-appearance');

    try {
        content = JSON.parse(content) ?? {};
    } catch (err) {
        content = {};
    }

    if (getDefault) {

        content.isEmbedEnabled = typeof content.isEmbedEnabled === 'boolean' ? content.isEmbedEnabled : true;
        content.isUNhoverEnabled = typeof content.isUNhoverEnabled === 'boolean' ? content.isUNhoverEnabled : true;
        content.isAnimateAvatarsEnabled = typeof content.isAnimateAvatarsEnabled === 'boolean' ? content.isAnimateAvatarsEnabled : true;

        content.showUserDMstatus = typeof content.showUserDMstatus === 'boolean' ? content.showUserDMstatus : true;
        content.pinDMmessages = typeof content.pinDMmessages === 'boolean' ? content.pinDMmessages : true;
        content.sendMessageEnter = typeof content.sendMessageEnter === 'boolean' ? content.sendMessageEnter : true;

        content.enableAnimParams = typeof content.enableAnimParams === 'boolean' ? content.enableAnimParams : !!__ENV_APP__.USE_ANIM_PARAMS;

        content.useFreezePlugin = typeof content.useFreezePlugin === 'boolean' ? content.useFreezePlugin : false;

    }

    if (typeof folder === 'string' && folder.length > 0) {
        if (typeof content[folder] !== 'undefined') return content[folder];
        return null;
    }

    return content;

};

export function getAnimatedImageUrl(url) {
    if (typeof url === 'string') return `${url}&animated=true`;
    return null;
};

export function setAppearance(folder, value) {
    const content = getAppearance(null, false);
    content[folder] = value;
    global.localStorage.setItem('ponyHouse-appearance', JSON.stringify(content));
};

const toggleAppearanceAction = (dataFolder, setToggle) => data => {

    setAppearance(dataFolder, data);
    setToggle((data === true));

};
export { toggleAppearanceAction };

global.appearanceApi = {
    getCfg: getAppearance,
    setCfg: setAppearance,
};