import * as colors from 'console-log-colors';
import { objType } from '../../src/util/tools';

export default function sinkingYachts() {

    // Welcome
    console.log(`${colors.cyan('[Sinking Yachts]')} Scammers protection mod activated! https://sinking.yachts/`);

    // Function
    tinyAPI.on('openUrlChecker', (data, host, protocol) => new Promise((resolve, reject) => {
        if ((protocol === 'https:' || protocol === 'http:') && (!objType(data, 'object') || !data.isScammer)) {
            const newTinyData = { isScammer: false };
            fetch(`https://phish.sinking.yachts/v2/check/${host}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', },
            }).then(res => res.json()).then(result => {
                newTinyData.isScammer = result;
                resolve(newTinyData);
            }).catch(reject);
        } else { resolve(data); }
    }));

};