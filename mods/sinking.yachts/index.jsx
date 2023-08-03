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
                mode: 'no-cors',
                method: 'GET',
                headers: { 'Accept': 'application/json', },
            }).then(res => res.text()).then(result => {

                console.log(result, host);
                resolve(newTinyData);

            }).catch(reject);
        } else { resolve(data); }
    }));

};