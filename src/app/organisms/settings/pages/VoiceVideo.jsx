import React, { useState, useEffect } from 'react';

const listDevices = async () => {

    const devices = await navigator.mediaDevices?.enumerateDevices?.();
    if (devices) {
        const video = [];
        const audio = [];
        for (const device of devices) {
            switch (device.kind) {
                case 'videoinput': video.push(device); break;
                case 'audioinput': audio.push(device); break;
            }
        }
        return { video, audio };
    }

    throw new Error('Media Devices API is not supported.');

};


function VoiceVideoSection() {

    const [selectedAudio, setselectedAudio] = useState(null);
    const [selectedVideo, setselectedVideo] = useState(null);

    useEffect(() => {
        listDevices().then(devices => {

            const video = devices.video;  // input video devices as array (e.g. web cameras)
            const audio = devices.audio;  // input audio devices as array (e.g. microphones)
            console.log('video:', video);
            console.log('audio:', audio);

        }).catch(err => {
            console.error(err);
            alert(err.message);
        });
    }, []);

    return (
        <div className="noselect">

        </div>
    );

};

export default VoiceVideoSection;