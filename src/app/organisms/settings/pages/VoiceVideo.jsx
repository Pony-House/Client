import React, { useState, useEffect, useRef } from 'react';

let loadingDevices = false;
let devices;
const listDevices = async () => {

    loadingDevices = true;
    const devicesResult = await navigator.mediaDevices?.enumerateDevices?.();
    if (devicesResult) {

        const video = [];
        const audio = [];
        const speaker = [];

        for (const device of devicesResult) {
            switch (device.kind) {
                case 'videoinput': video.push(device); break;
                case 'audioinput': audio.push(device); break;
                case 'audiooutput': speaker.push(device); break;
            }
        }

        loadingDevices = false;
        devices = { video, audio, speaker };
        return devices;

    }

    loadingDevices = false;
    throw new Error('Media Devices API is not supported.');

};

const validatorVolume = (value) => {

    if (typeof value === 'number' || typeof value === 'string') {

        const newValue = Number(value);

        return !Number.isNaN(newValue) && Number.isFinite(newValue) ?
            newValue >= 0 ? newValue <= 100 ? newValue : 100 : 0 : 100;

    }

    return 100;

};

function VoiceVideoSection() {

    const [devicesItem, setDevicesItem] = useState(null);

    const [videoDevice, setVideoDevice] = useState(global.localStorage.getItem('tinyVideoDevice'));

    const [audioDevice, setAudioDevice] = useState(global.localStorage.getItem('tinyAudioDevice'));
    const [speakerDevice, setSpeakerDevice] = useState(global.localStorage.getItem('tinySpeakerDevice'));

    const audioVolumeRef = useRef(null);
    const speakerVolumeRef = useRef(null);

    useEffect(() => {

        const audioVolume = $(audioVolumeRef.current);
        const speakerVolume = $(speakerVolumeRef.current);

        let tinyAudioVolume = global.localStorage.getItem('tinyAudioVolume');
        let tinySpeakerVolume = global.localStorage.getItem('tinySpeakerVolume');

        tinyAudioVolume = validatorVolume(tinyAudioVolume);
        tinySpeakerVolume = validatorVolume(tinySpeakerVolume);

        audioVolume.val(tinyAudioVolume);
        speakerVolume.val(tinySpeakerVolume);

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

    return (<>

        <div className="card noselect">
            <ul className="list-group list-group-flush">

                <li className="list-group-item very-small text-gray">Voice Settings</li>

                <li className="list-group-item border-0">

                    <div className='row'>

                        <div className='col-md-6'>
                            <div className='very-small text-uppercase fw-bold mb-2'>Input Device</div>
                            <select class="form-select form-control-bg">
                                <option>Choose...</option>
                                {devicesItem && Array.isArray(devicesItem.audio) && devicesItem.audio.length > 0 ?
                                    devicesItem.audio.map(item => <option value={item.deviceId}>{item.label}</option>)
                                    : null}
                            </select>
                        </div>

                        <div className='col-md-6'>
                            <div className='very-small text-uppercase fw-bold mb-2'>Output Device</div>
                            <select class="form-select form-control-bg">
                                <option>Choose...</option>
                                {devicesItem && Array.isArray(devicesItem.speaker) && devicesItem.speaker.length > 0 ?
                                    devicesItem.speaker.map(item => <option value={item.deviceId}>{item.label}</option>)
                                    : null}
                            </select>
                        </div>

                    </div>

                </li>

                <li className="list-group-item border-0">

                    <div className='row'>

                        <div className='col-md-6'>
                            <div className='very-small text-uppercase fw-bold mb-2'>Input Volume</div>
                            <input ref={audioVolumeRef} type="range" class="form-range" min={0} max={100} />
                        </div>

                        <div className='col-md-6'>
                            <div className='very-small text-uppercase fw-bold mb-2'>Output Volume</div>
                            <input ref={speakerVolumeRef} type="range" class="form-range" min={0} max={100} />
                        </div>

                    </div>

                </li>

                <li className="list-group-item border-0">
                    <div className='very-small text-uppercase fw-bold mb-1'>Mic Test</div>
                    <div className='very-small mb-2'>Having mic issues? Start a test and say something fun. Your voice will be played back to you.</div>
                    <div class="input-group input-group-sm mb-3">
                        <button class="btn btn-outline-secondary" type="button" id="button-addon1">Let&apos;s Check</button>
                        <input type="text" class="form-control form-control-bg" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1" />
                    </div>
                </li>



            </ul>
        </div>

        <div className="card noselect mt-3">
            <ul className="list-group list-group-flush">

                <li className="list-group-item very-small text-gray">Video Settings</li>

                <li className="list-group-item border-0">

                    <div className="ratio ratio-16x9 w-50 border border-bg mb-2">



                    </div>

                    <div className='very-small text-uppercase fw-bold mb-2'>Camera</div>
                    <select class="form-select form-control-bg">
                        <option selected>Choose...</option>
                        {devicesItem && Array.isArray(devicesItem.video) && devicesItem.video.length > 0 ?
                            devicesItem.video.map(item => <option value={item.deviceId}>{item.label}</option>)
                            : null}
                    </select>

                </li>

            </ul>
        </div>

    </>
    );

};

export default VoiceVideoSection;