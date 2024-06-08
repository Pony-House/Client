import { EventEmitter } from 'events';
import { eventMaxListeners } from '../matrixUtil';

class FavIconManager extends EventEmitter {
  constructor() {
    super();
    this.urlBase = './img/png/';
    this.icon = 'cinny.png';
    this.title = document.title;
    this.subTitle = null;
    this.notis = 0;
    this.directCount = 0;
    this.unread = false;
  }

  _sendUpdateData() {
    this.emit('valueChange', {
      urlBase: this.urlBase,
      unread: this.unread,
      icon: this.icon,
      title: this.title,
      subTitle: this.subTitle,
      notis: this.notis,
      directCount: this.directCount,
    });
  }

  getUrlBase() {
    return this.urlBase;
  }

  getIcon() {
    return this.icon;
  }

  getTitle() {
    return this.title;
  }

  getSubTitle() {
    return this.subTitle;
  }

  getNotis() {
    return this.notis;
  }

  getDirectCount() {
    return this.directCount;
  }

  isUnread() {
    return this.unread;
  }

  favIconQuery() {
    return $('head > #app-favicon');
  }

  titleQuery() {
    return $('head > title');
  }

  changeFavIconSubtitle(value) {
    if (typeof value === 'string') this.subTitle = value;
    this._sendUpdateData();
  }

  resetFavIconSubtitle() {
    this.subTitle = null;
    this._sendUpdateData();
  }

  changeFavIcon(value, unread = false, notis = 0, directCount = 0) {
    if (typeof value === 'string') {
      this.icon = value;

      if (typeof notis === 'number') this.notis = notis;
      if (typeof directCount === 'number') this.directCount = directCount;
      if (typeof unread === 'boolean') this.unread = unread;
      const newValue = `${this.urlBase}${this.icon}`;

      this.favIconQuery().attr('href', newValue);
      // document.title = !unread ? this.title : `${typeof notis === 'number' && notis > 0 ? `${notis <= 99 ? `(${String(notis)})` : '(+99)'} ` : ''}${this.title}`;

      document.title = !this.unread
        ? this.title
        : `${typeof this.notis === 'number' ? `(${this.directCount > 0 ? `${this.directCount < 99 ? String(this.directCount) : '99+'}` : '•'}) ` : ''}${this.title}${typeof this.subTitle === 'string' ? ` | ${this.subTitle}` : ''}`;

      this._sendUpdateData();
    }
  }

  favIconValue() {
    return this.icon;
  }

  checkerFavIcon() {
    const tinyThis = this;
    setTimeout(() => {
      // Number of messages from rooms which has "All Messages" notifications enabled or when mentionned in a room with "Mentions & Keyword" notifications level.
      let directCount = 0;
      // Number of messages for rooms which has "Mentions & Keyword" notifications level set which does not directly mention you.
      let indirectCount = 0;

      // Retrieves notification badges
      const badges = $('.sidebar .sidebar-1 .notification-badge:not(.ignore-notification)');
      for (const badge of badges) {
        indirectCount++;
        const nb = Number($(badge).text());

        if (!Number.isNaN(nb) && Number.isFinite(nb)) {
          directCount += nb;
        }
      }

      // Change Icon
      const finalNumber = directCount || indirectCount;
      if (finalNumber > 0) {
        tinyThis.changeFavIcon('cinny-unread-red.png', true, finalNumber, directCount);
        if (__ENV_APP__.ELECTRON_MODE) {
          global.changeTrayIcon('cinny-unread-red.png');
          global.changeAppIcon('cinny-unread-red.png');
        }
      } else {
        tinyThis.changeFavIcon('cinny.png', false, finalNumber);
        if (__ENV_APP__.ELECTRON_MODE) {
          global.changeTrayIcon('cinny.png');
          global.changeAppIcon('cinny.png');
        }
      }
    }, 100);
  }
}

const favIconManager = new FavIconManager();
favIconManager.setMaxListeners(eventMaxListeners);
export default favIconManager;
