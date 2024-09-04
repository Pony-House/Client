// import startTest from './test';

// import helloWorld from './lib/hello-world';
// import { startSinkingYachts } from './messages/sinking.yachts';
import customMessages from './messages/customMessages';
import unstoppableDomains from './web3/unstoppableDomains';

import catppuccinTheme from './themes/catppuccin';

export function startCustomThemes() {
  catppuccinTheme();
}

export default function startMods(firstTime) {
  // startSinkingYachts(firstTime);
  // helloWorld(firstTime);
  // startTest(firstTime);

  customMessages(firstTime);
  unstoppableDomains(firstTime);
}
