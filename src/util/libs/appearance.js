import initMatrix from '@src/client/initMatrix';
import EventEmitter from 'events';
import clone from 'clone';
import moment, { calendarFormat, localeIs12Hours } from './momentjs';
import { objType } from '../tools';

// Animated Image Url
export function getAnimatedImageUrl(url) {
  if (typeof url === 'string') return `${url}&animated=true`;
  return null;
}

// Emitter
class MatrixAppearance extends EventEmitter {
  constructor() {
    super();
    this.Initialized = false;
  }

  start() {
    if (!this.Initialized) {
      this.Initialized = true;

      // Get Content
      this.content = global.localStorage.getItem('ponyHouse-appearance');

      try {
        this.content = JSON.parse(this.content) ?? {};
      } catch (err) {
        this.content = {};
      }

      // Calendar Format
      let needSetCalendarFormat = true;
      if (
        typeof this.content.calendarFormat === 'string' ||
        typeof this.content.calendarFormat === 'number'
      ) {
        const timeIndex = Number(this.content.calendarFormat);
        if (!isNaN(timeIndex)) {
          const tinyFormat = calendarFormat[Number(this.content.calendarFormat)];
          if (objType(tinyFormat, 'object') && typeof tinyFormat.text === 'string') {
            needSetCalendarFormat = false;
          }
        }
      }

      if (needSetCalendarFormat) {
        const guestCalendarFormat = moment.localeData().longDateFormat('L');
        const index = calendarFormat.findIndex((item) => item.text === guestCalendarFormat);
        if (index > -1) {
          const tinyFormat = calendarFormat[index];
          if (objType(tinyFormat, 'object') && typeof tinyFormat.text === 'string')
            this.content.calendarFormat = String(index);
        }
      }

      // Other data
      this.content.isEmbedEnabled =
        typeof this.content.isEmbedEnabled === 'boolean' ? this.content.isEmbedEnabled : true;
      this.content.isUNhoverEnabled =
        typeof this.content.isUNhoverEnabled === 'boolean' ? this.content.isUNhoverEnabled : false;
      this.content.isAnimateAvatarsEnabled =
        typeof this.content.isAnimateAvatarsEnabled === 'boolean'
          ? this.content.isAnimateAvatarsEnabled
          : true;

      this.content.is24hours =
        typeof this.content.is24hours === 'boolean' ? this.content.is24hours : !localeIs12Hours();

      this.content.showStickers =
        typeof this.content.showStickers === 'boolean'
          ? this.content.showStickers
          : !!__ENV_APP__.SHOW_STICKERS;

      this.content.useCustomEmojis =
        typeof this.content.useCustomEmojis === 'boolean'
          ? this.content.useCustomEmojis
          : !!__ENV_APP__.USE_CUSTOM_EMOJIS;

      this.content.sendFileBefore =
        typeof this.content.sendFileBefore === 'boolean' ? this.content.sendFileBefore : true;

      this.content.orderHomeByActivity =
        typeof this.content.orderHomeByActivity === 'boolean'
          ? this.content.orderHomeByActivity
          : true;

      this.content.forceThreadButton =
        typeof this.content.forceThreadButton === 'boolean'
          ? this.content.forceThreadButton
          : false;

      this.content.showUserDMstatus =
        typeof this.content.showUserDMstatus === 'boolean' ? this.content.showUserDMstatus : true;
      this.content.pinDMmessages =
        typeof this.content.pinDMmessages === 'boolean' ? this.content.pinDMmessages : true;
      this.content.sendMessageEnter =
        typeof this.content.sendMessageEnter === 'boolean' ? this.content.sendMessageEnter : true;

      this.content.enableAnimParams =
        typeof this.content.enableAnimParams === 'boolean'
          ? this.content.enableAnimParams
          : !!__ENV_APP__.USE_ANIM_PARAMS;

      this.content.isDiscordStyleEnabled =
        typeof this.content.isDiscordStyleEnabled === 'boolean'
          ? this.content.isDiscordStyleEnabled
          : !!__ENV_APP__.DISCORD_STYLE;

      this.content.useFreezePlugin =
        typeof this.content.useFreezePlugin === 'boolean' ? this.content.useFreezePlugin : false;

      this.content.hidePinMessageEvents =
        typeof this.content.hidePinMessageEvents === 'boolean'
          ? this.content.hidePinMessageEvents
          : false;
      this.content.hideUnpinMessageEvents =
        typeof this.content.hideUnpinMessageEvents === 'boolean'
          ? this.content.hideUnpinMessageEvents
          : false;

      this.content.showRoomIdInSpacesManager =
        typeof this.content.showRoomIdInSpacesManager === 'boolean'
          ? this.content.showRoomIdInSpacesManager
          : false;

      this.content.noReconnectRefresh =
        typeof this.content.noReconnectRefresh === 'boolean'
          ? this.content.noReconnectRefresh
          : false;
    }
  }

  saveCloud() {
    initMatrix.matrixClient.setAccountData('pony.house.appearance', clone(this.content));
  }

  loadCloud() {
    const cloudData =
      initMatrix.matrixClient.getAccountData('pony.house.appearance')?.getContent() ?? {};
    for (const configName in cloudData) {
      this.set(configName, cloudData[configName]);
    }
  }

  get(folder) {
    this.start();
    if (typeof folder === 'string' && folder.length > 0) {
      if (typeof this.content[folder] !== 'undefined') return this.content[folder];
      return null;
    }

    return this.content;
  }

  set(folder, value) {
    this.start();
    if (typeof folder === 'string') {
      this.content[folder] = value;
      global.localStorage.setItem('ponyHouse-appearance', JSON.stringify(this.content));
      this.emit(folder, value);
    }
  }
}

// Functions and class
const matrixAppearance = new MatrixAppearance();
export function getAppearance(folder) {
  return matrixAppearance.get(folder);
}

export function setAppearance(folder, value) {
  return matrixAppearance.set(folder, value);
}

const toggleAppearanceAction = (dataFolder, setToggle) => (data) => {
  setAppearance(dataFolder, data);
  setToggle(data === true);
};

matrixAppearance.setMaxListeners(Infinity);

export { toggleAppearanceAction };
export default matrixAppearance;

if (__ENV_APP__.MODE === 'development') {
  global.appearanceApi = {
    getCfg: getAppearance,
    setCfg: setAppearance,
  };
}
