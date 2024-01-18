import { useState, useEffect } from 'react';
import EventEmitter from 'events';

import initMatrix from '../../client/initMatrix';

// Emitter
class MatrixDevices extends EventEmitter {

  constructor() {

    super();
    this.devices = [];

  }

  updateDevices(devices) {
    if (Array.isArray(devices)) this.devices = devices;
  }

  getDevices() {
    return this.devices;
  }

};

const matrixDevices = new MatrixDevices();

export { matrixDevices };
export function useDeviceList() {

  // Data
  const mx = initMatrix.matrixClient;
  const [deviceList, setDeviceList] = useState(null);

  // Effect
  useEffect(() => {

    let isMounted = true;

    // Start update
    const updateDevices = () => mx.getDevices().then((data) => {
      if (!isMounted) return;
      const devices = data.devices || [];
      matrixDevices.updateDevices(devices);
      matrixDevices.emit('devicesUpdated', devices);
      setDeviceList(devices);
    });

    // First check
    updateDevices();

    // Get update
    const handleDevicesUpdate = (users) => {
      if (users.includes(mx.getUserId())) {
        updateDevices();
      }
    };

    // Events
    mx.on('crypto.devicesUpdated', handleDevicesUpdate);
    return () => {
      mx.removeListener('crypto.devicesUpdated', handleDevicesUpdate);
      isMounted = false;
    };

  }, []);

  // Complete
  return deviceList;

};
