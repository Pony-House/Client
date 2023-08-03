import * as colors from 'console-log-colors';
import { objType } from '../../src/util/tools';

export default function sinkingYachts() {

    // Welcome
    console.log(`${colors.cyan('[Sinking Yachts]')} Scammers protection mod activated! https://sinking.yachts/`);

    // Function
    tinyAPI.on('openUrlChecker', (data, host) => {
        if (!objType(data, 'object') || !data.isScammer) {

            console.log(host);
            // return { isScammer: true };

        } else { return data; }
    });

};