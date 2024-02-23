import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import EventEmitter from 'events';

// Emitter
class MobileEvents extends EventEmitter {
  constructor() {
    super();

    const tinyThis = this;
    if (Capacitor.isNativePlatform())
      App.addListener('backButton', (data) => tinyThis.emit('backButton', data));
  }
}

const mobileEvents = new MobileEvents();
export default mobileEvents;
