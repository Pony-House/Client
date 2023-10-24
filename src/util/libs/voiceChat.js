/* eslint-disable class-methods-use-this */
import { createNewMatrixCall } from "matrix-js-sdk";
import { EventEmitter } from 'events';

import initMatrix from "../../client/initMatrix";

// Emitter
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

// Class
class MatrixVoiceChat {

    // Constructor
    constructor(mx) {
        this.mx = mx || initMatrix.matrixClient;
        this.call = null;
    }

    // Create Call
    create(roomId) {
        this.stop();
        this.roomId = roomId;
        this.call = createNewMatrixCall(this.mx, roomId);
        return this.call;
    }

    stop() {
        if (this.call) this.call.reject();
    }

    // Call
    getCall() { return this.call; }

    placeCall(audio = false, video = false) {
        if (this.call) {

            // Stop other call
            this.call.reject();

            // Insert Call
            this.call.placeCall(audio, video);

            // this.call.on();

        }
    }

    // Get
    getCurrentCallStats() { return this.call && this.call.isLocalOnHold(); }

    getFeeds() { return this.call && this.call.getFeeds(); }

    getLocalFeeds() { return this.call && this.call.getLocalFeeds(); }

    getOpponentDeviceId() { return this.call && this.call.getOpponentDeviceId(); }

    getOpponentMember() { return this.call && this.call.getOpponentMember(); }

    getOpponentSessionId() { return this.call && this.call.getOpponentSessionId(); }

    getRemoteAssertedIdentity() { return this.call && this.call.getRemoteAssertedIdentity(); }

    getRemoteFeeds() { return this.call && this.call.getRemoteFeeds(); }

    isLocalOnHold() { return this.call && this.call.isLocalOnHold(); }

    isLocalVideoMuted() { return this.call && this.call.isLocalVideoMuted(); }

    isMicrophoneMuted() { return this.call && this.call.isMicrophoneMuted(); }

    isRemoteOnHold() { return this.call && this.call.isRemoteOnHold(); }

    isScreensharing() { return this.call && this.call.isScreensharing(); }

    opponentCanBeTransferred() { return this.call && this.call.opponentCanBeTransferred(); }

    opponentSupportsDTMF() { return this.call && this.call.opponentSupportsDTMF(); }

    opponentSupportsSDPStreamMetadata() { return this.call && this.call.opponentSupportsSDPStreamMetadata(); }

    // Set
    setLocalVideoMuted(muted) { return this.call && this.call.setLocalVideoMuted(muted); }

    setMicrophoneMuted(muted) { return this.call && this.call.setMicrophoneMuted(muted); }

    setRemoteOnHold(onHold) { return this.call && this.call.setRemoteOnHold(onHold); }

    setScreensharingEnabled(enabled, opts) { return this.call && this.call.setScreensharingEnabled(enabled, opts); }

    // Replace
    replacedBy(newCall) {
        if (this.call) this.call.replacedBy(newCall);
    }

    // Transfer
    transfer(targetUserId) {
        if (this.call) this.call.transfer(targetUserId);
    }

    transferToCall(transferTargetCall) {
        if (this.call) this.call.transferToCall(transferTargetCall);
    }

    // Update Stream
    updateLocalUsermediaStream(stream, forceAudio, forceVideo) {
        if (this.call) this.call.updateLocalUsermediaStream(stream, forceAudio, forceVideo);
    }

    // Reject a call This used to be done by calling hangup, but is a separate method and protocol event as of MSC2746.
    reject() {
        if (this.call) this.call.reject();
    }

    // Call Time
    hangup(reason, suppressEvent) {
        if (this.call) this.call.hangup(reason, suppressEvent);
    }

    initStats(stats, peerId) {
        if (this.call) this.call.initStats(stats, peerId);
    }

    initWithHangup(event) {
        if (this.call) this.call.initWithHangup(event);
    }

    initWithInvite(event) {
        if (this.call) this.call.initWithInvite(event);
    }

    // Events
    on(event, callback) {
        myEmitter.on(event, callback);
    }

    off(event, callback) {
        myEmitter.off(event, callback);
    }

    once(event, callback) {
        myEmitter.once(event, callback);
    }

};

// Base
let vc;
export default function getVoiceChat(mx) {
    if (!vc) vc = new MatrixVoiceChat(mx);
    return vc;
};