export function getIpfsCfg(folder) {

    let content = global.localStorage.getItem('ponyHouse-ipfs');

    try {
        content = JSON.parse(content) ?? {};
    } catch (err) {
        content = {};
    }

    if (typeof folder === 'string' && folder.length > 0) {
        if (typeof content[folder] !== 'undefined') return content[folder];
        return null;
    }

    return content;

};

export function setIpfsCfg(folder, value) {
    const content = getIpfsCfg();
    content[folder] = value;
    global.localStorage.setItem('ponyHouse-ipfs', JSON.stringify(content));
}