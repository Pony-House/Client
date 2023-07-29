import * as linkify from 'linkifyjs';

import initMatrix from '../../client/initMatrix';
import { objType } from '../tools';

const tinyCache = {};
setInterval(() => {
    for (const item in tinyCache) {
        if (tinyCache[item] && typeof tinyCache[item].timeout > 0 && objType(tinyCache[item].data, 'object')) {
            tinyCache[item].timeout--;
        } else {
            delete tinyCache[item];
        }
    }
}, 60000);

const urlConvert = {
    http: (url) => `https${url.substring(4, url.length)}`,
};

export default function getUrlPreview(url, ts = 0) {
    return new Promise((resolve, reject) => {
        const mx = initMatrix.matrixClient;
        if (typeof url === 'string' && linkify.test(url)) {

            if (
                tinyCache[url] &&
                (objType(tinyCache[url].data, 'object') || tinyCache[url].data === null)
            ) {
                resolve(tinyCache[url].data);
            } else {

                let tinyUrl = url;
                for (const item in urlConvert) {
                    if (tinyUrl.startsWith(`${item}://`)) {
                        tinyUrl = urlConvert[item](tinyUrl);
                        break;
                    }
                }

                mx.getUrlPreview(tinyUrl, ts).then(embed => {
                    tinyCache[url] = { data: embed, timeout: 60 };
                    resolve(embed);
                }).catch(err => {
                    tinyCache[url] = { data: null, timeout: 60 };
                    reject(err);
                });

            }

        }
    });
};