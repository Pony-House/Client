import React, { useState, useEffect } from 'react';

let loadingDevices = false;
let devices;
const listDevices = async () => {

    loadingDevices = true;
    const devicesResult = await navigator.mediaDevices?.enumerateDevices?.();
    if (devicesResult) {

        const video = [];
        const audio = [];

        for (const device of devicesResult) {
            switch (device.kind) {
                case 'videoinput': video.push(device); break;
                case 'audioinput': audio.push(device); break;
            }
        }

        loadingDevices = false;
        devices = { video, audio };
        return devices;

    }

    loadingDevices = false;
    throw new Error('Media Devices API is not supported.');

};


function VoiceVideoSection() {

    const [devicesItem, setDevicesItem] = useState(null);
    useEffect(() => {

        if (!loadingDevices && devicesItem === null) {
            listDevices().then(devices2 => {
                setDevicesItem(devices2);
            }).catch(err => {
                console.error(err);
                alert(err.message);
            });
        } else {
            setDevicesItem(devices);
        }

        return () => { if (devicesItem !== null) setDevicesItem(null); };

    });

    console.log(devicesItem);

    return (
        <div className="noselect">

        </div>
    );

};

export default VoiceVideoSection;