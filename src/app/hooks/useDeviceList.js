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
const sendPing = () => {

  const devicesMap = [];
  const devices = matrixDevices.getDevices();
  for (const item in devices) {
    devicesMap.push({
      userId: devices[item].user_id,
      deviceId: devices[item].device_id,
      payload: initMatrix.matrixClient.getDeviceId(),
    });
  }

  console.log(devicesMap);
  if (devicesMap.length > 0) {
    initMatrix.matrixClient.queueToDevice({ eventType: 'devicePing', batch: devicesMap });
  }

};

// setTimeout(() => sendPing(), 60000 * 30);
let firstTime = true;
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

      if (firstTime) {
        firstTime = false;
        // sendPing();
      }

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

    const handleDevicesPing = (deviceId) => {
      // console.log(deviceId);
    };

    // Events
    mx.on('crypto.devicesUpdated', handleDevicesUpdate);
    mx.on('devicePing', handleDevicesPing);
    return () => {
      mx.removeListener('crypto.devicesUpdated', handleDevicesUpdate);
      mx.removeListener('devicePing', handleDevicesPing);
      isMounted = false;
    };

  }, []);

  // Complete
  return deviceList;

};
