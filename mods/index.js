// import startTest from './test';

// import helloWorld from './lib/hello-world';
// import sinkingYachts from './messages/sinking.yachts';
import customMessages from './messages/customMessages';
import unstoppableDomains from './web3/unstoppableDomains';

export default function startMods(firstTime) {

    // sinkingYachts(firstTime);
    // helloWorld(firstTime);
    // startTest(firstTime);

    customMessages(firstTime);
    unstoppableDomains(firstTime);

}; 