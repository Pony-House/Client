// Checker
import { objType } from '../util/tools';

// Lang Cache
const langs = {

    default: 'en',
    selected: null,

    list: {
        en: 'English'
    },

    data: {},

};

// Refresh Lang
export function refreshLang() {
    global.refreshLang = refreshLang;
    return new Promise((resolve, reject) => {

        // Fix Default
        if (!langs.selected || !langs.list[langs.selected]) langs.selected = langs.default;

        // Get Default Data
        fetch(`./public/lang/${langs.default}.json`, {
            headers: {
                'Accept': 'application/json'
            }
        }).then(res => res.json()).then(data => {
            if (objType(data, 'object')) {

                // Insert Default Items
                for (const item in data) {
                    if (typeof data[item] === 'string') langs.data[item] = data[item];
                }

                // Insert Custom Lang
                if (langs.selected !== langs.default) {
                    fetch(`./public/lang/${langs.selected}.json`, {
                        headers: {
                            'Accept': 'application/json'
                        }
                    }).then(res => res.json()).then(data2 => {

                        if (objType(data2, 'object')) {

                            // Insert Items
                            for (const item in data2) {
                                if (typeof data2[item] === 'string') langs.data[item] = data2[item];
                            }

                            // Complete
                            resolve(true);

                        } else {
                            console.error(new Error(`[${langs.selected}] INVALID LANG JSON! THIS NEED TO BE OBJECT WITH STRINGS! USING DEFAULT LANG FOR NOW. (${langs.default})`));
                            resolve(false);
                        }

                    }).catch(reject);
                } else { resolve(true); }

            } else { langs.data = {}; reject(new Error(`[${langs.default}] INVALID DEFAULT LANG JSON! THIS NEED TO BE OBJECT WITH STRINGS!`)); }
        }).catch(reject);

    });
};

// Load Text
export function getI18(item) { return langs.data[item]; };