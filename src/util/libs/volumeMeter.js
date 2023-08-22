function VolumeMeter(context) {
    this.context = context;
    this.volume = 0.0;
    this.script = context.createScriptProcessor(2048, 1, 1);
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

VolumeMeter.prototype.connectToSource = function (stream, callback) {
    try {
        this.mic = this.context.createMediaStreamSource(stream);
        this.mic.connect(this.script);
        this.script.connect(this.context.destination);
        if (typeof callback !== 'undefined') {
            callback(null);
        }
    } catch (e) {
        // what to do on error?
    }
};

VolumeMeter.prototype.stop = function () {
    this.mic.disconnect();
    this.script.disconnect();
};

export default VolumeMeter;