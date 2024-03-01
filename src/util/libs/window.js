import EventEmitter from 'events';

// Emitter
class WindowEvents extends EventEmitter {
  constructor() {
    super();
    this.visible = null;
    this.evtMap = null;
  }

  setWindowVisible(value) {
    if (typeof value === 'string' && this.visible !== value) {
      this.visible = value;
      this.emit('setWindowVisible', value);
    }
  }

  setEvtMap(value) {
    if (typeof value === 'string' && this.evtMap !== value) {
      this.evtMap = value;
      this.emit('setEvtMap', value);
    }
  }

  getWindowVisible() {
    return this.visible;
  }

  getEvtMap() {
    return this.evtMap;
  }
}

const windowEvents = new WindowEvents();
windowEvents.setMaxListeners(Infinity);

export default windowEvents;
