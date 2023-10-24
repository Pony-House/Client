/* eslint-disable class-methods-use-this */
// Example --> https://github.com/matrix-org/matrix-js-sdk/blob/develop/examples/voip/browserTest.js
import { createNewMatrixCall } from 'matrix-js-sdk';
import { EventEmitter } from 'events';

import initMatrix from '../../client/initMatrix';


// Emitter
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

// Class
class MatrixVoiceChat {

    // Constructor
    constructor(mx) {

        // Prepare Class
        this.mx = mx || initMatrix.matrixClient;

        this.call = null;
        this.roomId = null;
        this.started = false;

        this.callId = null;
        this.direction = null;
        this.groupCallId = null;
        this.hangupParty = null;
        this.hangupReason = null;
        this.invitee = null;
        this.isPtt = null;
        this.ourPartyId = null;
        this.peerConn = null;
        this.toDeviceSeq = null;
        this.err = null;

        const tinyThis = this;

        // Incoming...
        this.mx.on('Call.incoming', (c) => {

            console.log('Call ringing', c);

            /*
            disableButtons(true, false, false);
            document.getElementById("result").innerHTML = "<p>Incoming call...</p>";
            call = c;
            addListeners(call);
            */

            if (!tinyThis.call) {
                // tinyThis.call = c;
            } else {
                // c.reject();
            }

        });

    }

    // Create Call
    create(roomId) {

        this.stop();

        this.roomId = roomId;
        this.call = createNewMatrixCall(this.mx, roomId);
        this.start();

        return this.call;

    }

    stop() {

        if (this.call) this.call.reject();

        this.roomId = null;

        this.err = null;

        this.callId = null;
        this.direction = null;
        this.groupCallId = null;
        this.hangupParty = null;
        this.hangupReason = null;
        this.invitee = null;
        this.isPtt = null;
        this.ourPartyId = null;
        this.peerConn = null;
        this.toDeviceSeq = null;
        this.started = false;

    }

    // Start Call
    start() {
        if (this.call && !this.started) {

            const tinyThis = this;
            this.started = true;

            /*
            function disableButtons(place, answer, hangup) {
                document.getElementById("hangup").disabled = hangup;
                document.getElementById("answer").disabled = answer;
                document.getElementById("call").disabled = place;
            }
            */

            this.call.on('hangup', () => {

                console.error('hangup');

                /*
                disableButtons(false, true, true);
                document.getElementById('result').innerHTML = '<p>Call ended. Last error: ' + tinyThis.err + '</p>';
                */

            });
            this.call.on('error', (err) => {

                console.error('Call Error', err);

                tinyThis.err = err;
                /*
                call.hangup();
                disableButtons(false, true, true);
                */

            });
            this.call.on('feeds_changed', (feeds) => {

                const localFeed = feeds.find((feed) => feed.isLocal());
                const remoteFeed = feeds.find((feed) => !feed.isLocal());

                console.log('feeds_changed', localFeed, remoteFeed, feeds);

                /*
                const remoteElement = document.getElementById('remote');
                const localElement = document.getElementById('local');
        
                if (remoteFeed) {
                    remoteElement.srcObject = remoteFeed.stream;
                    remoteElement.play();
                }
                if (localFeed) {
                    localElement.muted = true;
                    localElement.srcObject = localFeed.stream;
                    localElement.play();
                }
                */

            });

        }
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

    callHasEnded() { return this.call && this.call.callHasEnded(); }

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

    answer(audio, video) {
        if (this.call) this.call.answer(audio, video);
    }

    answerWithCallFeeds(callFeeds) {
        if (this.call) this.call.answerWithCallFeeds(callFeeds);
    }

    // Data Channel
    createDataChannel(label, options) {
        if (this.call) this.call.createDataChannel(label, options);
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

    // Emit
    emit(event, args) {
        if (this.call) return this.call.emit(event, args);
    }

    emitPromised(event, args) {
        if (this.call) return this.call.emitPromised(event, args);
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

/*
    document.getElementById("call").onclick = function () {
        console.log("Placing call...");
        call = matrixcs.createNewMatrixCall(client, ROOM_ID);
        console.log("Call => %s", call);
        addListeners(call);
        call.placeVideoCall();
        document.getElementById("result").innerHTML = "<p>Placed call.</p>";
        disableButtons(true, true, false);
    };

    document.getElementById("hangup").onclick = function () {
        console.log("Hanging up call...");
        console.log("Call => %s", call);
        call.hangup();
        document.getElementById("result").innerHTML = "<p>Hungup call.</p>";
    };

    document.getElementById("answer").onclick = function () {
        console.log("Answering call...");
        console.log("Call => %s", call);
        call.answer();
        disableButtons(true, true, false);
        document.getElementById("result").innerHTML = "<p>Answered call.</p>";
    };
*/

// Base
let vc;
export default function getVoiceChat(mx) {
    if (!vc) vc = new MatrixVoiceChat(mx);
    return vc;
};