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

export default function getUrlPreview(url, ts = 0) {
    return new Promise((resolve, reject) => {
        const mx = initMatrix.matrixClient;
        if (typeof url === 'string') {
            if (

                tinyCache[url] &&

                (
                    objType(tinyCache[url].data, 'object') ||
                    tinyCache[url].data === null
                )

            ) {
                resolve(tinyCache[url].data);
            } else {
                mx.getUrlPreview(url, ts).then(embed => {

                    tinyCache[url] = {
                        data: embed,
                        timeout: 60
                    };

                    resolve(embed);

                }).catch(err => {

                    tinyCache[url] = {
                        data: null,
                        timeout: 60
                    };

                    reject(err);

                });
            }

        }
    });
};