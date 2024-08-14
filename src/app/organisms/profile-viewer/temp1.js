// Ethereum Config
const ethConfig = getWeb3Cfg();

// MenuBar Reasons
let menubarReasons = 0;

// Check presence and ethereum data
const existPresence = accountContent && accountContent.presenceStatusMsg;
const ethereumValid =
  envAPI.get('WEB3') &&
  existPresence &&
  accountContent.presenceStatusMsg.ethereum &&
  accountContent.presenceStatusMsg.ethereum.valid;

// Exist Presence
if (existPresence) {
  // Ethereum
  if (ethConfig.web3Enabled && ethereumValid) {
    menubarReasons++;
  }

  // About Page
  /* renderAbout(
      userPronounsRef,
      ethereumValid,
      displayNameRef,
      customStatusRef,
      profileBanner,
      bioRef,
      timezoneRef,
      content,
    ); */
}

// enableMenuBar(content, ethereumValid, menubarReasons);
