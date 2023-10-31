import * as Y from 'yjs';
import EventEmitter from 'events';

import initMatrix from '../initMatrix';
import cons from './cons';

import settings from './settings';
import { messageIsClassicCrdt } from '../../util/libs/crdt';
import { objType } from '../../util/tools';

let timeoutForceChatbox = null;

function isEdited(mEvent) {
  return mEvent.getRelation()?.rel_type === 'm.replace';
}

function isReaction(mEvent) {
  return mEvent.getType() === 'm.reaction';
}

function hideMemberEvents(mEvent) {
  const content = mEvent.getContent();
  const prevContent = mEvent.getPrevContent();
  const { membership } = content;
  if (settings.hideMembershipEvents) {
    if (membership === 'invite' || membership === 'ban' || membership === 'leave') return true;
    if (prevContent.membership !== 'join') return true;
  }
  if (settings.hideNickAvatarEvents) {
    if (membership === 'join' && prevContent.membership === 'join') return true;
  }
  return false;
}

function getRelateToId(mEvent) {
  const relation = mEvent.getRelation();
  return relation && relation.event_id;
}

function addToMap(myMap, mEvent) {
  const relateToId = getRelateToId(mEvent);
  if (relateToId === null) return null;
  const mEventId = mEvent.getId();

  if (typeof myMap.get(relateToId) === 'undefined') myMap.set(relateToId, []);
  const mEvents = myMap.get(relateToId);
  if (mEvents.find((ev) => ev.getId() === mEventId)) return mEvent;
  mEvents.push(mEvent);
  return mEvent;
}

function getFirstLinkedTimeline(timeline) {
  let tm = timeline;
  while (tm.prevTimeline) {
    tm = tm.prevTimeline;
  }
  return tm;
}
function getLastLinkedTimeline(timeline) {
  let tm = timeline;
  while (tm.nextTimeline) {
    tm = tm.nextTimeline;
  }
  return tm;
}

function iterateLinkedTimelines(timeline, backwards, callback) {
  let tm = timeline;
  while (tm) {
    callback(tm);
    if (backwards) tm = tm.prevTimeline;
    else tm = tm.nextTimeline;
  }
}

function isTimelineLinked(tm1, tm2) {
  let tm = getFirstLinkedTimeline(tm1);
  while (tm) {
    if (tm === tm2) return true;
    tm = tm.nextTimeline;
  }
  return false;
}

// Class
class RoomTimeline extends EventEmitter {

  constructor(roomId) {

    super();
    // These are local timelines
    this.timeline = [];
    this.crdt = {};
    this.editedTimeline = new Map();
    this.reactionTimeline = new Map();
    this.typingMembers = new Set();

    this.matrixClient = initMatrix.matrixClient;
    this.roomId = roomId;
    this.room = this.matrixClient.getRoom(roomId);

    this.liveTimeline = this.room.getLiveTimeline();
    this.activeTimeline = this.liveTimeline;

    this.isOngoingPagination = false;
    this.ongoingDecryptionCount = 0;
    this.initialized = false;
    this.ydoc = null;
    this.snapshot_countdown = null;

    setTimeout(() => this.room.loadMembersIfNeeded());

    // TODO: remove below line
    window.selectedRoom = this;

  }

  getYdoc() { return this.ydoc; }

  isServingLiveTimeline() {
    return getLastLinkedTimeline(this.activeTimeline) === this.liveTimeline;
  }

  canPaginateBackward() {
    if (this.timeline[0]?.getType() === 'm.room.create') return false;
    const tm = getFirstLinkedTimeline(this.activeTimeline);
    return tm.getPaginationToken('b') !== null;
  }

  canPaginateForward() {
    return !this.isServingLiveTimeline();
  }

  isEncrypted() {
    return this.matrixClient.isRoomEncrypted(this.roomId);
  }

  clearLocalTimelines() {
    this.timeline = [];
    this.crdt = {};
  }

  // Add to timeline
  addToTimeline(mEvent) {

    const evType = mEvent.getType();
    if (evType !== 'pony.house.crdt' && !messageIsClassicCrdt(mEvent)) {

      // Filter Room Member Event and Matrix CRDT Events
      if ((evType === 'm.room.member' && hideMemberEvents(mEvent))) {
        return;
      }

      // Redacted
      if (mEvent.isRedacted()) return;

      // Is Reaction
      if (isReaction(mEvent)) {
        addToMap(this.reactionTimeline, mEvent);
        return;
      }

      // Support event types filter
      if (!cons.supportEventTypes.includes(evType)) return;
      if (isEdited(mEvent)) {
        addToMap(this.editedTimeline, mEvent);
        return;
      }

      // Timeline insert
      this.timeline.push(mEvent);

    }

    // CRDT
    else if (evType === 'pony.house.crdt') {

      const content = mEvent.getContent();
      if (objType(content, 'object') && typeof content.type === 'string' && content.type.length > 0) {

        if (!Array.isArray(this.crdt[content.type])) this.crdt[content.type] = [];
        this.crdt[content.type].push(mEvent);

      } else {

        if (!Array.isArray(this.crdt.DEFAULT)) this.crdt.DEFAULT = [];
        this.crdt.DEFAULT.push(mEvent);

      }

    } else {
      if (!Array.isArray(this.crdt.CLASSIC)) this.crdt.CLASSIC = [];
      this.crdt.CLASSIC.push(mEvent);
    }

    // this.mx.sendEvent(this.roomId, this.eventName, { data });
    console.log(mEvent, evType, this.crdt);

  }

  // Populate Functions
  _populateAllLinkedEvents(timeline) {
    const firstTimeline = getFirstLinkedTimeline(timeline);
    iterateLinkedTimelines(firstTimeline, false, (tm) => {
      tm.getEvents().forEach((mEvent) => this.addToTimeline(mEvent));
    });
  }

  _populateTimelines() {
    this.clearLocalTimelines();
    this._populateAllLinkedEvents(this.activeTimeline);
  }

  // Reset
  async _reset() {

    if (this.isEncrypted()) await this.decryptAllEventsOfTimeline(this.activeTimeline);
    this._populateTimelines();

    if (!this.initialized) {
      this.initialized = true;
      this._listenEvents();
    }

  }

  // Load live timeline
  async loadLiveTimeline() {
    this.activeTimeline = this.liveTimeline;
    await this._reset();
    this.emit(cons.events.roomTimeline.READY, null);
    return true;
  }

  // Load Event timeline
  async loadEventTimeline(eventId) {

    // we use first unfiltered EventTimelineSet for room pagination.
    $('body').addClass('fo-cb-top').removeClass('cb-top-page');
    if (timeoutForceChatbox) {
      clearTimeout(timeoutForceChatbox);
    }

    const timelineSet = this.getUnfilteredTimelineSet();

    try {

      const eventTimeline = await this.matrixClient.getEventTimeline(timelineSet, eventId);
      this.activeTimeline = eventTimeline;
      await this._reset();
      this.emit(cons.events.roomTimeline.READY, eventId);

      timeoutForceChatbox = setTimeout(() => $('body').removeClass('fo-cb-top'), 500);

      return true;

    } catch {
      timeoutForceChatbox = setTimeout(() => $('body').removeClass('fo-cb-top'), 500);
      return false;
    }

  }

  // Pagination
  async paginateTimeline(backwards = false, limit = 30) {

    // Initialization
    if (this.initialized === false) return false;
    if (this.isOngoingPagination) return false;

    this.isOngoingPagination = true;

    // Get timeline
    const timelineToPaginate = backwards
      ? getFirstLinkedTimeline(this.activeTimeline)
      : getLastLinkedTimeline(this.activeTimeline);

    // Token Type
    if (timelineToPaginate.getPaginationToken(backwards ? 'b' : 'f') === null) {
      this.emit(cons.events.roomTimeline.PAGINATED, backwards, 0);
      this.isOngoingPagination = false;
      return false;
    }

    // Old Size
    const oldSize = this.timeline.length;

    // Try time
    try {

      // Paginate time
      await this.matrixClient.paginateEventTimeline(timelineToPaginate, { backwards, limit });

      // Decrypt time
      if (this.isEncrypted()) await this.decryptAllEventsOfTimeline(this.activeTimeline);
      this._populateTimelines();

      // Loaded Check
      const loaded = this.timeline.length - oldSize;

      // Complete
      this.emit(cons.events.roomTimeline.PAGINATED, backwards, loaded);
      this.isOngoingPagination = false;
      return true;

    }

    // Error
    catch {
      this.emit(cons.events.roomTimeline.PAGINATED, backwards, 0);
      this.isOngoingPagination = false;
      return false;
    }

  }

  // Decrypt Events
  decryptAllEventsOfTimeline(eventTimeline) {
    const decryptionPromises = eventTimeline
      .getEvents()
      .filter((event) => event.isEncrypted() && !event.clearEvent)
      .reverse()
      .map((event) => event.attemptDecryption(this.matrixClient.getCrypto(), { isRetry: true }));

    return Promise.allSettled(decryptionPromises);
  }

  // Has Event timeline
  hasEventInTimeline(eventId, timeline = this.activeTimeline) {
    const timelineSet = this.getUnfilteredTimelineSet();
    const eventTimeline = timelineSet.getTimelineForEvent(eventId);
    if (!eventTimeline) return false;
    return isTimelineLinked(eventTimeline, timeline);
  }

  // Get without filter
  getUnfilteredTimelineSet() {
    return this.room.getUnfilteredTimelineSet();
  }

  // Get User renders
  getEventReaders(mEvent) {

    const liveEvents = this.liveTimeline.getEvents();
    const readers = [];
    if (!mEvent) return [];

    for (let i = liveEvents.length - 1; i >= 0; i -= 1) {
      readers.splice(readers.length, 0, ...this.room.getUsersReadUpTo(liveEvents[i]));
      if (mEvent === liveEvents[i]) break;
    }

    return [...new Set(readers)];

  }

  getLiveReaders() {

    const liveEvents = this.liveTimeline.getEvents();
    const getLatestVisibleEvent = () => {

      for (let i = liveEvents.length - 1; i >= 0; i -= 1) {

        const mEvent = liveEvents[i];
        if (mEvent.getType() === 'm.room.member' && hideMemberEvents(mEvent)) {
          // eslint-disable-next-line no-continue
          continue;
        }

        if (!mEvent.isRedacted()
          && !isReaction(mEvent)
          && !isEdited(mEvent)
          && cons.supportEventTypes.includes(mEvent.getType())
        ) return mEvent;

      }

      return liveEvents[liveEvents.length - 1];

    };

    return this.getEventReaders(getLatestVisibleEvent());
  }

  getUnreadEventIndex(readUpToEventId) {

    if (!this.hasEventInTimeline(readUpToEventId)) return -1;

    const readUpToEvent = this.findEventByIdInTimelineSet(readUpToEventId);
    if (!readUpToEvent) return -1;
    const rTs = readUpToEvent.getTs();

    const tLength = this.timeline.length;

    for (let i = 0; i < tLength; i += 1) {
      const mEvent = this.timeline[i];
      if (mEvent.getTs() > rTs) return i;
    }

    return -1;

  }

  // Events
  getReadUpToEventId() {
    return this.room.getEventReadUpTo(this.matrixClient.getUserId());
  }

  getEventIndex(eventId) {
    return this.timeline.findIndex((mEvent) => mEvent.getId() === eventId);
  }

  findEventByIdInTimelineSet(eventId, eventTimelineSet = this.getUnfilteredTimelineSet()) {
    return eventTimelineSet.findEventById(eventId);
  }

  findEventById(eventId) {
    return this.timeline[this.getEventIndex(eventId)] ?? null;
  }

  deleteFromTimeline(eventId) {
    const i = this.getEventIndex(eventId);
    if (i === -1) return undefined;
    return this.timeline.splice(i, 1)[0];
  }

  // CRDT
  deleteCrdtFromTimeline(eventId, where = 'DEFAULT') {
    if (Array.isArray(this.crdt[where])) {
      const i = this.getCrdtIndex(eventId, where);
      if (i === -1) return undefined;
      return this.crdt[where].splice(i, 1)[0];
    }
  }

  findCrdtById(eventId, where = 'DEFAULT') {
    if (Array.isArray(this.crdt[where])) {
      return this.crdt[where][this.getCrdtIndex(eventId)] ?? null;
    }
  }

  getCrdtIndex(eventId, where = 'DEFAULT') {
    if (Array.isArray(this.crdt[where])) {
      this.crdt[where].findIndex((mEvent) => mEvent.getId() === eventId);
    }
  }

  crdtTest(data, type = 'DEFAULT') {
    return this.matrixClient.sendEvent(this.roomId, 'pony.house.crdt', { data: btoa(JSON.stringify(data)), type });
  }

  crdtSnapshotTest(snapshot, type = 'DEFAULT') {
    return this.matrixClient.sendEvent(this.roomId, 'pony.house.crdt', { snapshot: btoa(JSON.stringify(snapshot)), type });
  }

  crdtTest2(data, type = 'DEFAULT') {

    let value = null;

    try {
      value = JSON.parse(atob(data));
    } catch (err) {
      value = null;
      console.error(err);
    }

    return value;

  }

  crdtSnapshotTest2(snapshot, type = 'DEFAULT') {

    let value = null;

    try {
      value = JSON.parse(atob(snapshot));
    } catch (err) {
      value = null;
      console.error(err);
    }

    return value;

  }

  // Active Listens
  _listenEvents() {

    const tinyThis = this;
    this.ydoc = new Y.Doc();

    this.ydoc.on('update', update => {
      if (!tinyThis.snapshot_countdown) {
        console.log('ydoc test', update);
        tinyThis.snapshot_countdown = setTimeout(() => {

          tinyThis.snapshot_countdown = null;

        }, 30000);
      }
    });

    this._listenRoomTimeline = (event, room, toStartOfTimeline, removed, data) => {

      if (room.roomId !== this.roomId) return;
      if (this.isOngoingPagination) return;

      // User is currently viewing the old events probably
      // no need to add new event and emit changes.
      // only add reactions and edited messages
      if (this.isServingLiveTimeline() === false) {
        if (!isReaction(event) && !isEdited(event)) return;
      }

      // We only process live events here
      if (!data.liveEvent) return;

      if (event.isEncrypted()) {
        // We will add this event after it is being decrypted.
        this.ongoingDecryptionCount += 1;
        return;
      }

      // FIXME: An unencrypted plain event can come
      // while previous event is still decrypting
      // and has not been added to timeline
      // causing unordered timeline view.

      this.addToTimeline(event);
      this.emit(cons.events.roomTimeline.EVENT, event);

    };

    this._listenDecryptEvent = (event) => {

      if (event.getRoomId() !== this.roomId) return;
      if (this.isOngoingPagination) return;

      // Not a live event.
      // so we don't need to process it here
      if (this.ongoingDecryptionCount === 0) return;

      if (this.ongoingDecryptionCount > 0) {
        this.ongoingDecryptionCount -= 1;
      }

      this.addToTimeline(event);
      this.emit(cons.events.roomTimeline.EVENT, event);

    };

    this._listenRedaction = (mEvent, room) => {
      if (room.roomId !== this.roomId) return;
      const rEvent = this.deleteFromTimeline(mEvent.event.redacts);
      this.editedTimeline.delete(mEvent.event.redacts);
      this.reactionTimeline.delete(mEvent.event.redacts);
      this.emit(cons.events.roomTimeline.EVENT_REDACTED, rEvent, mEvent);
    };

    this._listenTypingEvent = (event, member) => {

      if (member.roomId !== this.roomId) return;

      const isTyping = member.typing;
      if (isTyping) this.typingMembers.add(member.userId);
      else this.typingMembers.delete(member.userId);
      this.emit(cons.events.roomTimeline.TYPING_MEMBERS_UPDATED, new Set([...this.typingMembers]));

    };

    this._listenReciptEvent = (event, room) => {

      // we only process receipt for latest message here.
      if (room.roomId !== this.roomId) return;
      const receiptContent = event.getContent();

      const mEvents = this.liveTimeline.getEvents();
      const lastMEvent = mEvents[mEvents.length - 1];
      const lastEventId = lastMEvent.getId();
      const lastEventRecipt = receiptContent[lastEventId];

      if (typeof lastEventRecipt === 'undefined') return;
      if (lastEventRecipt['m.read']) {
        this.emit(cons.events.roomTimeline.LIVE_RECEIPT);
      }

    };

    // Insert events
    this.matrixClient.on('Room.timeline', this._listenRoomTimeline);
    this.matrixClient.on('Room.redaction', this._listenRedaction);
    this.matrixClient.on('Event.decrypted', this._listenDecryptEvent);
    this.matrixClient.on('RoomMember.typing', this._listenTypingEvent);
    this.matrixClient.on('Room.receipt', this._listenReciptEvent);

  }

  // Remove listeners
  removeInternalListeners() {
    if (!this.initialized) return;
    this.ydoc.destroy();
    this.matrixClient.removeListener('Room.timeline', this._listenRoomTimeline);
    this.matrixClient.removeListener('Room.redaction', this._listenRedaction);
    this.matrixClient.removeListener('Event.decrypted', this._listenDecryptEvent);
    this.matrixClient.removeListener('RoomMember.typing', this._listenTypingEvent);
    this.matrixClient.removeListener('Room.receipt', this._listenReciptEvent);
  }

}

export default RoomTimeline;
