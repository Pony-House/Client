import * as colors from 'console-log-colors';

export default function sinkingYachts() {

    // Welcome
    console.log(`${colors.cyan('[Sinking Yachts]')} Scammers protection mod activated! https://sinking.yachts/`);

    // Function
    tinyAPI.on('openUrlChecker', (data, host) => {

        console.log(host);
        // return { isScammer: true };

    });

};