import EventEmitter from 'events';

// Animated Image Url
export function getAnimatedImageUrl(url) {
    if (typeof url === 'string') return `${url}&animated=true`;
    return null;
}

// Emitter
class EnvAPI extends EventEmitter {
    constructor() {
        super();
        this.Initialized = false;
    }

    start() {
        if (!this.Initialized) {
            this.Initialized = true;

            this.content = global.localStorage.getItem('ponyHouse-env');

            try {
                this.content = JSON.parse(this.content) ?? {};
            } catch (err) {
                this.content = {};
            }

            this.content.WEB3 =
                typeof this.content.WEB3 === 'boolean' ? this.content.WEB3 : typeof __ENV_APP__.WEB3 === 'boolean' ? __ENV_APP__.WEB3 : true;

            this.content.WEB3 =
                typeof this.content.IPFS === 'boolean' ? this.content.IPFS : typeof __ENV_APP__.IPFS === 'boolean' ? __ENV_APP__.IPFS : true;

        }
    }

    get(folder) {
        this.start();
        if (typeof folder === 'string' && folder.length > 0) {
            if (typeof this.content[folder] !== 'undefined') return this.content[folder];
            return null;
        }

        return this.content;
    }

    set(folder, value) {
        this.start();
        if (typeof folder === 'string') {
            this.content[folder] = value;
            global.localStorage.setItem('ponyHouse-env', JSON.stringify(this.content));
            this.emit(folder, value);
        }
    }
}

// Functions and class
const envAPI = new EnvAPI();
export function getAppearance(folder) {
    return envAPI.get(folder);
}

envAPI.setMaxListeners(Infinity);
export default envAPI;

if (__ENV_APP__.MODE === 'development') {
    global.envAPI = envAPI;
}
