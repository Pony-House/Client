import { objType } from 'for-promise/utils/lib.mjs';

import initMatrix from '../../../client/initMatrix';

const toggleAction = (dataFolder, valueName, setToggle) => (data) => {
  const content = initMatrix.matrixClient.getAccountData(dataFolder)?.getContent() ?? {};
  content[valueName] = data;

  initMatrix.matrixClient.setAccountData(dataFolder, content);
  setToggle(data === true);
};

const toggleActionLocal = (dataFolder, valueName, setToggle) => (data) => {
  let content = global.localStorage.getItem(dataFolder);

  try {
    content = JSON.parse(content) ?? {};
  } catch (err) {
    content = {};
  }

  if (!objType(content, 'object')) {
    content = {};
  }
  if (typeof setToggle !== 'undefined') {
    content[valueName] = data;

    global.localStorage.setItem(dataFolder, JSON.stringify(content));
    if (typeof setToggle === 'function') setToggle(data === true);
    return;
  }

  if (valueName) {
    return content[valueName];
  }

  return content;
};

export { toggleAction, toggleActionLocal };
