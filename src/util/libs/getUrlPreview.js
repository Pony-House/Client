import * as linkify from 'linkifyjs';

import initMatrix from '../../client/initMatrix';
import { objType } from '../tools';
import convertProtocols from './convertProtocols';

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

export default function getUrlPreview(newUrl, ts = 0) {
    return new Promise((resolve, reject) => {
        const mx = initMatrix.matrixClient;
        if (typeof newUrl === 'string' && linkify.test(newUrl)) {

            const url = convertProtocols(newUrl, newUrl);

            if (
                tinyCache[url.href] &&
                (objType(tinyCache[url.href].data, 'object') || tinyCache[url.href].data === null)
            ) {
                resolve(tinyCache[url.href].data);
            } else {

                let tinyUrl = url.href;
                for (const item in urlConvert) {
                    if (tinyUrl.startsWith(`${item}://`)) {
                        tinyUrl = urlConvert[item](tinyUrl);
                        break;
                    }
                }

                mx.getUrlPreview(tinyUrl, ts).then(embed => {
                    tinyCache[url.href] = { data: embed, timeout: 60 };
                    resolve(embed);
                }).catch(err => {
                    tinyCache[url.href] = { data: null, timeout: 60 };
                    reject(err);
                });

            }

        }
    });
};