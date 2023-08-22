const micVolumeFilter = (tinyVideoVolumeUse) => Number(!Number.isNaN(tinyVideoVolumeUse) && Number.isFinite(tinyVideoVolumeUse) ?
    tinyVideoVolumeUse < 100 ?
        tinyVideoVolumeUse > 0 ? tinyVideoVolumeUse : 0
        : 100
    : 100) / 100;

function VolumeMeter() {
    this.context = new AudioContext();
    this.volume = 0.0;
    this.script = this.context.createScriptProcessor(2048, 1, 1);
    const that = this;
    this.script.onaudioprocess = function (event) {
        const input = event.inputBuffer.getChannelData(0);
        let sum = 0.0;
        for (let i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
        }
        that.volume = Math.sqrt(sum / input.length);
    };
};

VolumeMeter.prototype.connectToSource = function (stream, hearVoice, callback) {
    try {

        // Stream
        this.stream = stream;

        // Source
        this.source = this.context.createMediaStreamSource(stream);

        // Effect
        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = 1.0;

        // Connect Effects
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);

        // Connect Effect into script
        this.gainNode.connect(this.script);

        // Connect script into destination
        this.script.connect(this.context.destination);

        // Complete
        if (typeof callback === 'function') {
            callback(null);
        }

    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

VolumeMeter.prototype.setVolume = function (value) {
    if (this.gainNode) this.gainNode.gain.value = micVolumeFilter(value);
};

VolumeMeter.prototype.stop = function () {
    const that = this;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {

            that.source.disconnect();
            that.script.disconnect();
            this.gainNode.disconnect();

            if (that.stream) {
                await that.stream.getTracks().forEach(async (track) => {
                    await track.stop();
                });
            }

            resolve(true);

        } catch (err) {
            reject(err);
        }
    });
};

export default VolumeMeter;