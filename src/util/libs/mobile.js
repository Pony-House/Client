import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import EventEmitter from 'events';

// Emitter
class MobileEvents extends EventEmitter {
  constructor() {
    super();
    this.checkingNotificationPerm = false;
    this.allowNotifications = { display: null };

    const tinyThis = this;
    if (Capacitor.isNativePlatform())
      App.addListener('backButton', (data) => tinyThis.emit('backButton', data));
  }

  checkNotificationPerm() {
    const tinyThis = this;
    return new Promise((resolve, reject) => {
      if (!tinyThis.checkingNotificationPerm && Capacitor.isNativePlatform()) {
        tinyThis.checkingNotificationPerm = true;
        LocalNotifications.checkPermissions()
          .then(async (permStatus) => {
            tinyThis.allowNotifications = permStatus;
            if (tinyThis.allowNotifications.display === 'prompt') {
              tinyThis.allowNotifications = await LocalNotifications.requestPermissions();
            }

            if (tinyThis.allowNotifications.display !== 'granted') {
              tinyThis.checkingNotificationPerm = false;
              throw new Error('User denied mobile permissions!');
            }

            // return LocalNotifications.registerActionTypes({types: {}});
            tinyThis.checkingNotificationPerm = false;
            resolve(tinyThis.allowNotifications);
          })
          .catch((err) => {
            tinyThis.checkingNotificationPerm = false;
            reject(err);
          });
      }
    });
  }
}

const mobileEvents = new MobileEvents();
mobileEvents.setMaxListeners(Infinity);

export default mobileEvents;
