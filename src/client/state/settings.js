import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

import EventEmitter from 'events';
import appDispatcher from '../dispatcher';

import cons from './cons';
import tinyAPI from '../../util/mods';
import { objType } from '../../util/tools';

import blackTheme from '../../scss/theme/black';
import butterTheme from '../../scss/theme/butter';
import darkTheme from '../../scss/theme/dark';
import silverTheme from '../../scss/theme/silver';
import whiteTheme from '../../scss/theme/white';

const themes = {
  black: { data: blackTheme, id: 'black-theme', type: 'dark-solid' },
  butter: { data: butterTheme, id: 'butter-theme', type: 'dark2' },
  dark: { data: darkTheme, id: 'dark-theme', type: 'dark' },
  silver: { data: silverTheme, id: 'silver-theme', type: 'silver' },
  white: { data: whiteTheme, id: '', type: 'light' },
};


function getSettings() {
  const settings = localStorage.getItem('settings');
  if (settings === null) return null;
  return JSON.parse(settings);
}

function setSettings(key, value) {
  let settings = getSettings();
  if (settings === null) settings = {};
  settings[key] = value;
  localStorage.setItem('settings', JSON.stringify(settings));
}

class Settings extends EventEmitter {

  constructor() {

    super();
    this.themes = [themes.white, themes.silver, themes.dark, themes.butter, themes.black];

    this.themesName = [
      { text: 'Light' },
      { text: 'Silver' },
      { text: 'Dark' },
      { text: 'Butter' },
      { text: 'Black (Beta)' },
    ];

  }

  insertTheme(data, type = 'push') {
    if ((type === 'push' || type === 'unshift') && (typeof data[0] === 'string' || objType(data[0], 'object'))) {
      this.themesName[type](typeof data[0] === 'string' ? { text: data[0] } : data[0]);
      this.themes[type](data[1]);
    }
  }

  removeTheme(id) {
    if (typeof id === 'string') {

      const index = this.themes.findIndex(theme => theme.id === id);
      if (index > -1) {
        this.themes.splice(index, 1);
        this.themesName.splice(index, 1);
      }

    }
  }

  startData() {

    this.themeIndex = this.getThemeIndex();
    tinyAPI.emit('loadThemes',
      (data, type = 'push') => this.insertTheme(data, type),
      (id) => this.removeTheme(id)
    );

    this.useSystemTheme = this.getUseSystemTheme();
    this.isMarkdown = this.getIsMarkdown();
    this.isPeopleDrawer = this.getIsPeopleDrawer();
    this.hideMembershipEvents = this.getHideMembershipEvents();
    this.hideNickAvatarEvents = this.getHideNickAvatarEvents();
    this._showNotifications = this.getShowNotifications();
    this.isNotificationSounds = this.getIsNotificationSounds();

    this.isTouchScreenDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

  }

  getThemeIndex() {
    if (typeof this.themeIndex === 'number') return this.themeIndex;

    const settings = getSettings();
    if (settings === null) return 0;
    if (typeof settings.themeIndex === 'undefined') return 0;
    // eslint-disable-next-line radix
    return parseInt(settings.themeIndex);
  }

  getThemeName() {
    return this.themes[this.themeIndex].id;
  }

  getThemeData() {
    return this.themes[this.themeIndex].data;
  }

  getThemeType() {
    return this.themes[this.themeIndex].type;
  }

  changeMobileBackground(value = 'default') {
    const data = this.themes[this.themeIndex]?.data;
    return new Promise((resolve, reject) => {
      if (Capacitor.isNativePlatform()) {

        try {

          StatusBar.setBackgroundColor({ color: data.statusBar.backgroundColor[value] });
          StatusBar.setStyle({ style: data.statusBar.style });

        } catch (err) {
          reject(err);
          return;
        }

        resolve(true);

      } else {
        resolve(null);
      }
    });
  }

  _clearTheme() {

    $('body').removeClass('system-theme')
      .removeClass('theme-type-dark').removeClass('theme-type-dark-solid')
      .removeClass('theme-type-dark2').removeClass('theme-type-dark2-solid')
      .removeClass('theme-type-silver').removeClass('theme-type-silver-solid')
      .removeClass('theme-type-light').removeClass('theme-type-light-solid');

    if (Array.isArray(this.themes)) {
      this.themes.forEach((theme) => {
        if (typeof theme.id === 'string') {

          if (theme.id === '') {
            $('body').removeClass('default-theme');
            return;
          }

          $('body').removeClass(theme.id);

        }
      });
    }

  }

  applyTheme() {

    this._clearTheme();
    const body = $('body');

    if (this.useSystemTheme) {

      body.addClass('system-theme');

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.addClass(`theme-type-dark`);
      } else {
        body.addClass(`theme-type-light`);
      }

    } else if (this.themes[this.themeIndex]) {
      body.addClass(this.themes[this.themeIndex].id !== '' ? this.themes[this.themeIndex].id : 'default-theme').addClass(
        this.themes[this.themeIndex]?.type === 'dark' || this.themes[this.themeIndex]?.type === 'dark-solid' ||
          this.themes[this.themeIndex]?.type === 'dark2' || this.themes[this.themeIndex]?.type === 'dark2-solid' ||
          this.themes[this.themeIndex]?.type === 'light' || this.themes[this.themeIndex]?.type === 'light-solid' ||
          this.themes[this.themeIndex]?.type === 'silver' || this.themes[this.themeIndex]?.type === 'silver-solid' ?
          `theme-type-${this.themes[this.themeIndex]?.type}` : ''
      );
    }

    this.changeMobileBackground('default');

  }

  setTheme(themeIndex) {
    this.themeIndex = themeIndex;
    setSettings('themeIndex', this.themeIndex);
    this.applyTheme();
  }

  toggleUseSystemTheme() {
    this.useSystemTheme = !this.useSystemTheme;
    setSettings('useSystemTheme', this.useSystemTheme);
    this.applyTheme();

    this.emit(cons.events.settings.SYSTEM_THEME_TOGGLED, this.useSystemTheme);
  }

  getUseSystemTheme() {
    if (typeof this.useSystemTheme === 'boolean') return this.useSystemTheme;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.useSystemTheme === 'undefined') return true;
    return settings.useSystemTheme;
  }

  getIsMarkdown() {
    if (typeof this.isMarkdown === 'boolean') return this.isMarkdown;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.isMarkdown === 'undefined') return true;
    return settings.isMarkdown;
  }

  getHideMembershipEvents() {
    if (typeof this.hideMembershipEvents === 'boolean') return this.hideMembershipEvents;

    const settings = getSettings();
    if (settings === null) return false;
    if (typeof settings.hideMembershipEvents === 'undefined') return false;
    return settings.hideMembershipEvents;
  }

  getHideNickAvatarEvents() {
    if (typeof this.hideNickAvatarEvents === 'boolean') return this.hideNickAvatarEvents;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.hideNickAvatarEvents === 'undefined') return true;
    return settings.hideNickAvatarEvents;
  }

  getIsPeopleDrawer() {
    if (typeof this.isPeopleDrawer === 'boolean') return this.isPeopleDrawer;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.isPeopleDrawer === 'undefined') return true;
    return settings.isPeopleDrawer;
  }

  get showNotifications() {
    if (window.Notification?.permission !== 'granted') return false;
    return this._showNotifications;
  }

  getShowNotifications() {
    if (typeof this._showNotifications === 'boolean') return this._showNotifications;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.showNotifications === 'undefined') return true;
    return settings.showNotifications;
  }

  getIsNotificationSounds() {
    if (typeof this.isNotificationSounds === 'boolean') return this.isNotificationSounds;

    const settings = getSettings();
    if (settings === null) return true;
    if (typeof settings.isNotificationSounds === 'undefined') return true;
    return settings.isNotificationSounds;
  }

  setter(action) {
    const actions = {
      [cons.actions.settings.TOGGLE_SYSTEM_THEME]: () => {
        this.toggleUseSystemTheme();
      },
      [cons.actions.settings.TOGGLE_MARKDOWN]: () => {
        this.isMarkdown = !this.isMarkdown;
        setSettings('isMarkdown', this.isMarkdown);
        this.emit(cons.events.settings.MARKDOWN_TOGGLED, this.isMarkdown);
      },
      [cons.actions.settings.TOGGLE_PEOPLE_DRAWER]: () => {
        this.isPeopleDrawer = !this.isPeopleDrawer;
        setSettings('isPeopleDrawer', this.isPeopleDrawer);
        this.emit(cons.events.settings.PEOPLE_DRAWER_TOGGLED, this.isPeopleDrawer);
      },
      [cons.actions.settings.TOGGLE_MEMBERSHIP_EVENT]: () => {
        this.hideMembershipEvents = !this.hideMembershipEvents;
        setSettings('hideMembershipEvents', this.hideMembershipEvents);
        this.emit(cons.events.settings.MEMBERSHIP_EVENTS_TOGGLED, this.hideMembershipEvents);
      },
      [cons.actions.settings.TOGGLE_NICKAVATAR_EVENT]: () => {
        this.hideNickAvatarEvents = !this.hideNickAvatarEvents;
        setSettings('hideNickAvatarEvents', this.hideNickAvatarEvents);
        this.emit(cons.events.settings.NICKAVATAR_EVENTS_TOGGLED, this.hideNickAvatarEvents);
      },
      [cons.actions.settings.TOGGLE_NOTIFICATIONS]: async () => {
        if (window.Notification?.permission !== 'granted') {
          this._showNotifications = false;
        } else {
          this._showNotifications = !this._showNotifications;
        }
        setSettings('showNotifications', this._showNotifications);
        this.emit(cons.events.settings.NOTIFICATIONS_TOGGLED, this._showNotifications);
      },
      [cons.actions.settings.TOGGLE_NOTIFICATION_SOUNDS]: () => {
        this.isNotificationSounds = !this.isNotificationSounds;
        setSettings('isNotificationSounds', this.isNotificationSounds);
        this.emit(cons.events.settings.NOTIFICATION_SOUNDS_TOGGLED, this.isNotificationSounds);
      },
    };

    actions[action.type]?.();
  }
}

const settings = new Settings();
export function startSettings() {
  settings.startData();
  settings.applyTheme();
};

appDispatcher.register(settings.setter.bind(settings));
export default settings;
