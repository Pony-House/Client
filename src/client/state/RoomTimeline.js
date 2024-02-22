import * as Y from 'yjs';
import EventEmitter from 'events';
import clone from 'clone';
import objectHash from 'object-hash';
import moment from '@src/util/libs/momentjs';

import {
  Direction,
  EventTimeline,
  MatrixEventEvent,
  Room,
  RoomEvent,
  RoomMemberEvent,
} from 'matrix-js-sdk';

// import { setLoadingPage } from '@src/app/templates/client/Loading';
// import initMatrix, { fetchFn as fetch } from '../initMatrix';
import initMatrix from '../initMatrix';
import cons from './cons';

import settings from './settings';
import { messageIsClassicCrdt } from '../../util/libs/crdt';
import { objType } from '../../util/tools';

import { updateRoomInfo } from '../action/navigation';
import urlParams from '../../util/libs/urlParams';
import { tinyFixScrollChat } from '../../app/molecules/media/mediaFix';

const delayYdocUpdate = 100;
const hashTryLimit = 10;

if (__ENV_APP__.MODE === 'development') {
  global.Y = Y;
}
// let timeoutForceChatbox = null;

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
  return relation && (relation.event_id ?? null);
}

function addToMap(myMap, mEvent) {
  const relateToId = getRelateToId(mEvent);
  if (relateToId === null) return null;
  const mEventId = mEvent.getId();

  if (!myMap.has(relateToId)) myMap.set(relateToId, []);
  const mEvents = myMap.get(relateToId);
  if (mEvents.find((ev) => ev.getId() === mEventId)) return mEvent;
  mEvents.push(mEvent);
  return mEvent;
}

function getFirstLinkedTimeline(timeline) {
  let prevTimeline = timeline;
  let tm = prevTimeline;
  while (prevTimeline) {
    tm = prevTimeline;
    prevTimeline = prevTimeline.getNeighbouringTimeline(EventTimeline.BACKWARDS);
  }
  return tm;
}
function getLastLinkedTimeline(timeline) {
  let nextTimeline = timeline;
  let tm = nextTimeline;
  while (nextTimeline) {
    tm = nextTimeline;
    nextTimeline = nextTimeline.getNeighbouringTimeline(EventTimeline.FORWARDS);
  }
  return tm;
}

function iterateLinkedTimelines(timeline, backwards, callback) {
  let tm = timeline;
  while (tm) {
    callback(tm);
    if (backwards) tm = tm.getNeighbouringTimeline(EventTimeline.BACKWARDS);
    else tm = tm.getNeighbouringTimeline(EventTimeline.FORWARDS);
  }
}

function isTimelineLinked(tm1, tm2) {
  let tm = getFirstLinkedTimeline(tm1);
  while (tm) {
    if (tm === tm2) return true;
    tm = tm.getNeighbouringTimeline(EventTimeline.FORWARDS);
  }
  return false;
}

const getClientYjs = (updateInfo, callback) => {
  if (Array.isArray(updateInfo.structs) && updateInfo.structs.length > 0) {
    for (const item in updateInfo.structs) {
      const struct = updateInfo.structs[item];
      callback({ value: struct, key: struct.id.client }, 'structs');
    }
  }

  if (updateInfo.ds && objType(updateInfo.ds.clients, 'map')) {
    updateInfo.ds.clients.forEach((value, key) => {
      callback({ value, key }, 'deleted');
    });
  }
};

const enableyJsItem = {
  convertToString: (update) => btoa(update.toString()),

  action: (ydoc, type, parent) => {
    if (typeof enableyJsItem.types[type] === 'function') {
      return enableyJsItem.types[type](ydoc, parent);
    }
  },

  constructorToString: (parent) =>
    String(
      parent.constructor.name.startsWith('_')
        ? parent.constructor.name.substring(1)
        : parent.constructor.name,
    ).toLocaleLowerCase(),

  types: {
    ymap: (ydoc, parent) => ydoc.getMap(parent),
    ytext: (ydoc, parent) => ydoc.getText(parent),
    yarray: (ydoc, parent) => ydoc.getArray(parent),
  },

  convertToJson: {
    ymap: (data) => data.toJSON(),
    ytext: (data) => data.toString(),
    yarray: (data) => data.toArray(),
  },
};

// Class
class RoomTimeline extends EventEmitter {
  constructor(roomId, roomAlias = null, isGuest = false, guestId = null, refreshTime = null) {
    // Super!
    super();

    // These are local timelines
    this.timeline = [];
    this.crdt = {};
    this.editedTimeline = new Map();
    this.reactionTimeline = new Map();
    this.typingMembers = new Set();

    // Guest Data
    this.isGuest = isGuest;
    this.guestId = guestId;
    this.refreshTime = refreshTime;

    // Client Prepare
    this.matrixClient = initMatrix.matrixClient;
    this.roomId = roomId;
    this.roomAlias = roomAlias;

    this.room = !this.isGuest
      ? this.matrixClient.getRoom(roomId)
      : new Room(roomId, this.matrixClient, this.guestId, {
          lazyLoadMembers: true,
          timelineSupport: true,
        });

    // Nothing! Tiny cancel time.
    if (this.room === null) {
      throw new Error(`Created a RoomTimeline for a room that doesn't exist: ${roomId}`);
    }

    // Insert live timeline
    this.liveTimeline = this.room.getLiveTimeline();
    this.activeTimeline = this.liveTimeline;

    // More data
    this.isOngoingPagination = false;
    this.ongoingDecryptionCount = 0;
    this.initialized = false;

    // Ydoc data
    this._ydoc = {
      initialized: false,
      data: null,
      last_update: null,

      matrix_update: [],
      cache: [],
      send_events: [],
      sending_event: false,
      error_hash: null,
      error_hash_count: 0,

      cache_timeout: null,

      update_time: { timeout: null, cache: [] },
      init_cache: [],
    };

    // Is Guest
    if (this.isGuest) {
      const tinyThis = this;
      // Load Guest timeline
      this.loadGuestTimeline = () => {
        this.room.refreshLiveTimeline().then(() => {
          // Insert guest timeline
          tinyThis.liveTimeline = tinyThis.room.getLiveTimeline();
          tinyThis.activeTimeline = tinyThis.liveTimeline;

          // Update room info to RoomViewHeader.jsx
          updateRoomInfo();

          // Read Timeline
          if (
            objType(tinyThis.liveTimeline, 'object') &&
            Array.isArray(tinyThis.liveTimeline.events)
          ) {
            for (const item in tinyThis.liveTimeline.events) {
              // Anti Repeat
              let repeated = false;
              if (
                tinyThis.timeline.find(
                  (event) =>
                    typeof event.getId === 'function' &&
                    typeof tinyThis.liveTimeline.events[item].getId === 'function' &&
                    event.getId() === tinyThis.liveTimeline.events[item].getId(),
                )
              ) {
                repeated = true;
              }

              // Send events
              if (!repeated) {
                const event = tinyThis.liveTimeline.events[item];
                tinyThis.matrixClient.emit(RoomEvent.Timeline, event, tinyThis.room, true, false, {
                  liveEvent: true,
                  timeline: tinyThis.liveTimeline,
                });
              }
            }
          }
        });
      };

      // First load
      tinyThis._reset().then(() => {
        tinyThis.loadGuestTimeline();
      });
    }

    // Load Members
    setTimeout(() => this.room.loadMembersIfNeeded());

    // Dev
    if (__ENV_APP__.MODE === 'development') {
      window.selectedRoom = this;
    }
  }

  ydocWait() {
    const tinyThis = this;
    return new Promise((resolve) => {
      const tryYdoc = () => {
        if (tinyThis._ydoc) {
          resolve(tinyThis._ydoc);
        } else {
          setTimeout(tryYdoc, 100);
        }
      };

      tryYdoc();
    });
  }

  ydoc() {
    return this._ydoc.data;
  }

  getYmap(id) {
    return this.ydoc().getMap(id);
  }

  getYarray(id) {
    return this.ydoc().getArray(id);
  }

  getYtext(id) {
    return this.ydoc().getText(id);
  }

  static newFromThread(threadId, roomId) {
    const roomTimeline = new RoomTimeline(roomId);
    roomTimeline.setMaxListeners(Infinity);
    const thread = roomTimeline.room.getThread(threadId);
    if (!thread) return null;

    roomTimeline.liveTimeline = thread.liveTimeline;
    roomTimeline.activeTimeline = thread.liveTimeline;
    roomTimeline.threadId = threadId;
    roomTimeline.thread = thread;

    return roomTimeline;
  }

  isServingLiveTimeline() {
    return getLastLinkedTimeline(this.activeTimeline) === this.liveTimeline;
  }

  canPaginateBackward() {
    if (this.timeline[0]?.getType() === 'm.room.create') return false;
    const tm = getFirstLinkedTimeline(this.activeTimeline);
    return tm.getPaginationToken(Direction.Backward) !== null;
  }

  canPaginateForward() {
    return !this.isServingLiveTimeline();
  }

  isEncrypted() {
    return this.matrixClient.isRoomEncrypted(this.roomId);
  }

  clearLocalTimelines() {
    this.timeline = [];
    this._ydoc.init_cache = [];
    this.crdt = {};
  }

  // To JSON
  ydocToJson(tinyIds) {
    // Prepare Ids
    const ids = typeof tinyIds === 'string' ? [tinyIds] : Array.isArray(tinyIds) ? tinyIds : null;

    // Exist Doc
    if (this._ydoc.data) {
      // Prepare Functions
      const tinyResult = {};
      const getData = (value, key) => {
        const type = enableyJsItem.constructorToString(value);
        if (enableyJsItem.convertToJson[type]) {
          tinyResult[key] = enableyJsItem.convertToJson[type](value);
        }
      };

      // Null. Get all
      if (!ids || ids.length < 1) {
        this._ydoc.data.share.forEach(getData);
      }

      // Get Values
      else {
        for (const id in ids) {
          const item = this._ydoc.data.share.get(ids[id]);

          if (item) {
            getData(item, ids[0]);
          }
        }
      }

      return tinyResult;
    }

    // Invalid
    return null;
  }

  // Add crdt
  _addCrdt(content, timestamp) {
    // Tiny This
    const tinyThis = this;

    // Checker
    if (this._ydoc.data) {
      try {
        if (this._ydoc.last_update === null || timestamp > this._ydoc.last_update) {
          // Data
          if (typeof content.data === 'string' && content.data.length > 0) {
            // Get Data
            const data = atob(content.data).split(',');
            for (const item in data) {
              data[item] = Number(data[item]);
            }

            if (data.length > 1) {
              // Prepare to insert into update
              const memoryData = new Uint8Array(data);
              const updateInfo = Y.decodeUpdate(memoryData);
              const newKeys = [];

              getClientYjs(updateInfo, (info) => {
                newKeys.push(info.key);
                tinyThis._ydoc.matrix_update.push(info.key);
              });

              // Fix Doc
              if (
                typeof content.parent === 'string' &&
                typeof content.type === 'string' &&
                content.parent.length > 0 &&
                content.type.length > 0
              ) {
                enableyJsItem.action(this._ydoc.data, content.type, content.parent);
              }

              // Apply update
              const before = clone(this.ydocToJson());
              Y.applyUpdate(this._ydoc.data, memoryData);
              const after = clone(this.ydocToJson());

              if (objectHash(before) === objectHash(after)) {
                for (const ki in newKeys) {
                  const index = tinyThis._ydoc.matrix_update.indexOf(newKeys[ki]);
                  tinyThis._ydoc.matrix_update.splice(index, 1);
                }
              }
            }
          }

          // Snapshot
          else if (
            objType(content.snapshot, 'object') &&
            typeof content.snapshot.update === 'string' &&
            content.snapshot.update.length > 0 &&
            typeof content.snapshot.encode === 'string' &&
            content.snapshot.encode.length > 0
          ) {
            // Fix doc
            if (objType(content.snapshot.types, 'object')) {
              for (const key in content.snapshot.types) {
                if (
                  typeof content.snapshot.types[key] === 'string' &&
                  content.snapshot.types[key].length > 0
                ) {
                  enableyJsItem.action(this._ydoc.data, content.snapshot.types[key], key);
                }
              }
            }

            // Get Data
            const data = atob(content.snapshot.update).split(',');
            for (const item in data) {
              data[item] = Number(data[item]);
            }

            if (data.length > 1) {
              // Prepare to insert into update
              const memoryData = new Uint8Array(data);

              // Apply update
              this._ydoc.last_update = timestamp;
              Y.applyUpdate(this._ydoc.data, memoryData);
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Nope. Wait more
    else {
      this._ydoc.cache.push({ content, timestamp });

      if (this._ydoc.cache_timeout) {
        clearTimeout(this._ydoc.cache_timeout);
        this._ydoc.cache_timeout = null;
      }

      const tinyTimeout = () => {
        if (tinyThis._ydoc) {
          for (const item in tinyThis._ydoc.cache) {
            tinyThis._addCrdt(
              tinyThis._ydoc.cache[item].content,
              tinyThis._ydoc.cache[item].timestamp,
            );
          }

          tinyThis._ydoc.cache = [];
        } else {
          if (tinyThis._ydoc.cache_timeout) {
            clearTimeout(tinyThis._ydoc.cache_timeout);
            tinyThis._ydoc.cache_timeout = null;
          }

          tinyThis._ydoc.cache_timeout = setTimeout(tinyTimeout, 500);
        }
      };

      this._ydoc.cache_timeout = setTimeout(tinyTimeout, 500);
    }
  }

  // Add CRDT to timeline
  addCrdtToTimeline(evType, mEvent) {
    if (evType === 'pony.house.crdt') {
      const content = mEvent.getContent();
      if (objType(content, 'object')) {
        // Content Type
        if (typeof content.store === 'string' && content.store.length > 0) {
          if (!Array.isArray(this.crdt[content.store])) this.crdt[content.store] = [];
          this.crdt[content.store].push(mEvent);
        }

        // Classic values
        else {
          if (!Array.isArray(this.crdt.DEFAULT)) this.crdt.DEFAULT = [];
          this.crdt.DEFAULT.push(mEvent);
        }

        // Send to Crdt
        const eventDate = moment(mEvent.getDate());

        // No Reset
        if (!content.resetAll) {
          // Single
          if (!Array.isArray(content.multiData)) {
            this._addCrdt(content, eventDate.toDate());
          }

          // Multi
          else {
            for (const item in content.multiData) {
              if (objType(content.multiData[item], 'object')) {
                this._addCrdt(
                  content.multiData[item],
                  eventDate.clone().add(Number(item), 'seconds').toDate(),
                );
              }
            }
          }
        }

        // Reset
        else {
          this._disableYdoc();
          this._ydocEnable(new Y.Doc());
        }
      }
    } else {
      if (!Array.isArray(this.crdt.CLASSIC)) this.crdt.CLASSIC = [];
      this.crdt.CLASSIC.push(mEvent);
    }
  }

  // Add to timeline
  addToTimeline(mEvent) {
    const evType = mEvent.getType();
    if (evType !== 'pony.house.crdt' && !messageIsClassicCrdt(mEvent)) {
      // Filter Room Member Event and Matrix CRDT Events
      if (evType === 'm.room.member' && hideMemberEvents(mEvent)) {
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
    else if (this._ydoc.initialized) {
      this.addCrdtToTimeline(evType, mEvent);
    } else {
      this._ydoc.init_cache.push({ evType, mEvent });
    }
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

  // History Get
  /*
    https://matrix.org/docs/older/matrix-enact/
    https://github.com/benparsons/matrix-enact/blob/master/src/App.js
    https://github.com/matrix-org/matrix-js-sdk/issues/494
    https://matrix-org.github.io/matrix-js-sdk/stable/classes/MatrixClient.html#isGuest
  */
  /* loadScriptFromEventId(startEventId, isFirst = true) {
    const url = `${this.matrixClient.baseUrl}/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/context/${encodeURIComponent(startEventId)}?limit=100&access_token=${this.matrixClient.getAccessToken()}`;
    return new Promise((resolve, reject) => {
      fetch(url, {
        'Content-Type': 'application/json',
      }).then(res => res.json()).then(data => {

        resolve(data);

      }).catch(reject);
    });
  } */

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
    updateRoomInfo();
    return true;
  }

  // Load Event timeline
  async loadEventTimeline(eventId) {
    // we use first unfiltered EventTimelineSet for room pagination.
    // $('body').addClass('fo-cb-top').removeClass('cb-top-page');
    // if (timeoutForceChatbox) {
    //   clearTimeout(timeoutForceChatbox);
    // }

    const timelineSet = this.getUnfilteredTimelineSet();

    try {
      const eventTimeline = await this.matrixClient.getEventTimeline(timelineSet, eventId);
      if (!eventTimeline) {
        return false;
      }
      this.activeTimeline = eventTimeline;
      await this._reset();
      this.emit(cons.events.roomTimeline.READY, eventId);

      // timeoutForceChatbox = setTimeout(() => $('body').removeClass('fo-cb-top'), 500);

      if (typeof eventId === 'string' && eventId.length > 0) urlParams.set('event_id', eventId);
      else urlParams.delete('event_id');

      return true;
    } catch {
      // timeoutForceChatbox = setTimeout(() => $('body').removeClass('fo-cb-top'), 500);
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
    if (
      timelineToPaginate.getPaginationToken(backwards ? Direction.Backward : Direction.Forward) ===
      null
    ) {
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

      updateRoomInfo();
      urlParams.delete('event_id');
      return true;
    } catch {
      // Error
      this.emit(cons.events.roomTimeline.PAGINATED, backwards, 0);
      this.isOngoingPagination = false;
      return false;
    }
  }

  // Decrypt Events
  decryptAllEventsOfTimeline(eventTimeline) {
    const decryptionPromises = eventTimeline
      .getEvents()
      // .filter((event) => event.shouldAttemptDecryption())
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
    return this.thread?.getUnfilteredTimelineSet() ?? this.room.getUnfilteredTimelineSet();
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
          continue;
        }

        if (
          !mEvent.isRedacted() &&
          !isReaction(mEvent) &&
          !isEdited(mEvent) &&
          cons.supportEventTypes.includes(mEvent.getType())
        ) {
          // tinyFixScrollChat();
          return mEvent;
        }
      }

      // tinyFixScrollChat();
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

  getReadUpToEventId() {
    const userId = this.matrixClient.getUserId();
    if (!userId) return null;

    return this.thread?.getEventReadUpTo(userId) ?? this.room.getEventReadUpTo(userId);
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
      return this.crdt[where].findIndex((mEvent) => mEvent.getId() === eventId);
    }
  }

  snapshotCrdt() {
    const update = enableyJsItem.convertToString(Y.encodeStateAsUpdate(this._ydoc.data));
    const encode = enableyJsItem.convertToString(Y.encodeSnapshot(Y.snapshot(this._ydoc.data)));

    const types = {};
    this._ydoc.data.share.forEach((value, key) => {
      try {
        types[key] = String(
          value.constructor.name.startsWith('_')
            ? value.constructor.name.substring(1)
            : value.constructor.name,
        ).toLocaleLowerCase();
      } catch {
        types[key] = null;
      }
    });

    const newDoc = new Y.Doc();
    Y.applyUpdate(newDoc, update);

    this._disableYdoc();
    this._ydocEnable(newDoc);

    return { update, encode, types };
  }

  _tryInsertCrdtAgain() {
    const tinyThis = this;
    return new Promise((resolve, reject) => {
      if (tinyThis._ydoc.send_events.length > 0) {
        const newData = tinyThis._ydoc.send_events.shift();

        if (!tinyThis._ydoc.sending_event) {
          tinyThis._ydoc.sending_event = true;

          tinyThis.matrixClient
            .sendEvent(tinyThis.roomId, 'pony.house.crdt', newData)
            .then(() => {
              tinyThis._ydoc.sending_event = false;
              tinyThis._ydoc.error_hash = null;
              tinyThis._ydoc.error_hash_count = 0;
              resolve(tinyThis._tryInsertCrdtAgain());
            })
            .catch((err) => {
              console.error(err);
              tinyThis._ydoc.send_events.unshift(newData);
              tinyThis._ydoc.sending_event = false;

              const newError = objectHash(newData);

              if (newError !== tinyThis._ydoc.error_hash) {
                tinyThis._ydoc.error_hash = newError;
                tinyThis._ydoc.error_hash_count = 0;
              } else {
                tinyThis._ydoc.error_hash_count++;
              }

              if (tinyThis._ydoc.error_hash_count <= hashTryLimit) {
                resolve(tinyThis._tryInsertCrdtAgain());
              } else {
                alert(err.message, 'CRDT SYNC ERROR!');
                reject(err);
              }
            });
        } else {
          tinyThis._ydoc.send_events.unshift(newData);
          tinyThis._ydoc.sending_event = false;
          resolve(tinyThis._tryInsertCrdtAgain());
        }
      }

      resolve(true);
    });
  }

  _insertCrdt(data, type, parent, store = 'DEFAULT') {
    const tinyThis = this;
    return new Promise((resolve) => {
      const newData = { data, store, type, parent };
      if (!tinyThis._ydoc.sending_event) {
        tinyThis._ydoc.sending_event = true;

        tinyThis.matrixClient
          .sendEvent(tinyThis.roomId, 'pony.house.crdt', newData)
          .then(() => {
            tinyThis._ydoc.sending_event = false;
            tinyThis._ydoc.error_hash = null;
            resolve(tinyThis._tryInsertCrdtAgain());
          })
          .catch((err) => {
            console.error(err);
            tinyThis._ydoc.send_events.unshift(newData);
            tinyThis._ydoc.sending_event = false;
            tinyThis._ydoc.error_hash = objectHash(newData);
            resolve(tinyThis._tryInsertCrdtAgain());
          });
      } else {
        tinyThis._ydoc.send_events.push(newData);
        resolve(tinyThis._tryInsertCrdtAgain());
      }
    });
  }

  resetCrdt() {
    const tinyThis = this;
    return new Promise((resolve) => {
      const newData = { resetAll: true };
      if (!tinyThis._ydoc.sending_event) {
        tinyThis._ydoc.sending_event = true;

        tinyThis.matrixClient
          .sendEvent(tinyThis.roomId, 'pony.house.crdt', newData)
          .then(() => {
            tinyThis._ydoc.sending_event = false;
            tinyThis._ydoc.error_hash = null;
            resolve(tinyThis._tryInsertCrdtAgain());
          })
          .catch((err) => {
            console.error(err);
            tinyThis._ydoc.send_events.unshift(newData);
            tinyThis._ydoc.sending_event = false;
            tinyThis._ydoc.error_hash = objectHash(newData);
            resolve(tinyThis._tryInsertCrdtAgain());
          });
      } else {
        tinyThis._ydoc.send_events.push(newData);
        resolve(tinyThis._tryInsertCrdtAgain());
      }
    });
  }

  _insertCrdtMulti(multiData) {
    const tinyThis = this;
    return new Promise((resolve) => {
      const newData = { multiData };
      if (!tinyThis._ydoc.sending_event) {
        tinyThis._ydoc.sending_event = true;

        tinyThis.matrixClient
          .sendEvent(tinyThis.roomId, 'pony.house.crdt', newData)
          .then(() => {
            tinyThis._ydoc.sending_event = false;
            tinyThis._ydoc.error_hash = null;
            resolve(tinyThis._tryInsertCrdtAgain());
          })
          .catch((err) => {
            console.error(err);
            tinyThis._ydoc.send_events.unshift(newData);
            tinyThis._ydoc.sending_event = false;
            tinyThis._ydoc.error_hash = objectHash(newData);
            resolve(tinyThis._tryInsertCrdtAgain());
          });
      } else {
        tinyThis._ydoc.send_events.push(newData);
        resolve(tinyThis._tryInsertCrdtAgain());
      }
    });
  }

  _insertSnapshotCrdt(snapshot, type, parent, store = 'DEFAULT') {
    const tinyThis = this;
    return new Promise((resolve) => {
      const newData = { snapshot, store, type, parent };
      if (!tinyThis._ydoc.sending_event) {
        tinyThis._ydoc.sending_event = true;

        tinyThis.matrixClient
          .sendEvent(tinyThis.roomId, 'pony.house.crdt', newData)
          .then(() => {
            tinyThis._ydoc.sending_event = false;
            tinyThis._ydoc.error_hash = null;
            resolve(tinyThis._tryInsertCrdtAgain());
          })
          .catch((err) => {
            console.error(err);
            tinyThis._ydoc.send_events.unshift(newData);
            tinyThis._ydoc.sending_event = false;
            tinyThis._ydoc.error_hash = objectHash(newData);
            resolve(tinyThis._tryInsertCrdtAgain());
          });
      } else {
        tinyThis._ydoc.send_events.push(newData);
        resolve(tinyThis._tryInsertCrdtAgain());
      }
    });
  }

  _ydocEnable(ydoc) {
    const tinyThis = this;
    this._ydoc.data = ydoc;
    this._ydoc.matrix_update = [];

    this._ydoc.data.on('update', (update) => {
      const updateInfo = Y.decodeUpdate(update);

      // Checker
      let needUpdate = true;
      let itemType;
      let parent;
      getClientYjs(updateInfo, (info, type) => {
        // Get Index
        const index = tinyThis._ydoc.matrix_update.indexOf(info.key);
        if (index > -1) {
          tinyThis._ydoc.matrix_update.splice(index, 1);
          needUpdate = false;
        }

        // Get new value type
        else if (type === 'structs') {
          const struct = tinyThis._ydoc.data.store.clients.get(info.key);
          if (Array.isArray(struct) && struct.length > 0 && struct[struct.length - 1]) {
            const item = struct[struct.length - 1];

            try {
              itemType = enableyJsItem.constructorToString(item.parent);
            } catch {
              itemType = null;
            }

            if (typeof info.value.parent === 'string' && info.value.parent.length > 0) {
              parent = info.value.parent;
            }
          }
        }
      });

      // Insert update into the room
      if (needUpdate) {
        try {
          // Event Name
          const eventName = 'DEFAULT';

          const eventResult = () => {
            // Get CRDT List and user Id
            const items = tinyThis.crdt[eventName];
            // const userId = tinyThis.matrixClient.getUserId();

            // Counter Checker
            let crdtCount = 0;
            if (Array.isArray(items) && items.length > 0) {
              // Check Events
              for (const item in items) {
                // Get Content
                const content = items[item].getContent();

                // First Check
                if (
                  // userId === items[item].getSender() &&
                  objType(content, 'object') &&
                  content.store === eventName
                ) {
                  // Is Data
                  if (
                    (typeof content.data === 'string' && content.data.length > 0) ||
                    (Array.isArray(content.multiData) && content.multiData.length > 0)
                  ) {
                    crdtCount++;
                  }

                  // Is Snapshot
                  else if (
                    objType(content.snapshot, 'object') &&
                    typeof content.snapshot.update === 'string' &&
                    content.snapshot.update.length > 0 &&
                    typeof content.snapshot.encode === 'string' &&
                    content.snapshot.encode.length > 0
                  ) {
                    crdtCount = 0;
                  }
                }
              }
            }

            // Send snapshot
            if (crdtCount > 7) {
              tinyThis._insertSnapshotCrdt(tinyThis.snapshotCrdt(), itemType, parent, eventName);
            }
          };

          // Prepare Data
          tinyThis._ydoc.update_time.cache.push({
            data: enableyJsItem.convertToString(update),
            type: itemType,
            parent,
            store: eventName,
          });
          if (tinyThis._ydoc.update_time.timeout) clearTimeout(tinyThis._ydoc.update_time.timeout);

          // Insert CRDT and prepare to check snapshot sender
          tinyThis._ydoc.update_time.timeout = setTimeout(() => {
            if (tinyThis._ydoc.update_time.cache.length <= 1) {
              if (tinyThis._ydoc.update_time.cache[0]) {
                const newTinyData = clone(tinyThis._ydoc.update_time.cache[0]);
                tinyThis
                  ._insertCrdt(
                    newTinyData.data,
                    newTinyData.type,
                    newTinyData.parent,
                    newTinyData.store,
                  )
                  .then(eventResult);
              }
            } else {
              tinyThis._insertCrdtMulti(clone(tinyThis._ydoc.update_time.cache)).then(eventResult);
            }

            delete tinyThis._ydoc.update_time.cache;
            tinyThis._ydoc.update_time.cache = [];
          }, delayYdocUpdate);
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  _disableYdoc() {
    if (this._ydoc.data) this._ydoc.data.destroy();
    this._ydoc.matrix_update = [];
  }

  initYdoc() {
    if (!this._ydoc.initialized) {
      this._ydoc.initialized = true;
      this._ydocEnable(new Y.Doc());

      const initLength = this._ydoc.init_cache.length;
      if (initLength > 0) {
        for (let i = 0; i < initLength; i++) {
          let initData;
          try {
            initData = this._ydoc.init_cache.shift();
          } catch {
            initData = null;
          }

          if (initData) this.addCrdtToTimeline(initData.evType, initData.mEvent);
        }
      }
    }
  }

  // Active Listens
  _listenEvents() {
    this._listenRoomTimeline = (event, room, toStartOfTimeline, removed, data) => {
      if (room.roomId !== this.roomId || event.threadRootId !== this.threadId) return;
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
      tinyFixScrollChat();
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
      tinyFixScrollChat();
    };

    this._listenRedaction = (mEvent, room) => {
      if (room.roomId !== this.roomId) return;
      const rEvent = this.deleteFromTimeline(mEvent.event.redacts);
      this.editedTimeline.delete(mEvent.event.redacts);
      this.reactionTimeline.delete(mEvent.event.redacts);
      this.emit(cons.events.roomTimeline.EVENT_REDACTED, rEvent, mEvent);
      tinyFixScrollChat();
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
      tinyFixScrollChat();
    };

    // Insert events
    this.matrixClient.on(RoomEvent.Timeline, this._listenRoomTimeline);
    this.matrixClient.on(RoomEvent.Redaction, this._listenRedaction);
    this.matrixClient.on(MatrixEventEvent.Decrypted, this._listenDecryptEvent);
    this.matrixClient.on(RoomMemberEvent.Typing, this._listenTypingEvent);
    this.matrixClient.on(RoomEvent.Receipt, this._listenReciptEvent);

    if (this.isGuest && typeof this.refreshTime === 'number' && this.refreshTime > 0) {
      this.refreshTimelineInterval = setInterval(
        () => this.loadGuestTimeline(),
        60000 * this.refreshTime,
      );
    }
  }

  removeInternalListeners() {
    if (!this.initialized) return;
    this._disableYdoc();

    this.matrixClient.removeListener(RoomEvent.Timeline, this._listenRoomTimeline);
    this.matrixClient.removeListener(RoomEvent.Redaction, this._listenRedaction);
    this.matrixClient.removeListener(MatrixEventEvent.Decrypted, this._listenDecryptEvent);
    this.matrixClient.removeListener(RoomMemberEvent.Typing, this._listenTypingEvent);
    this.matrixClient.removeListener(RoomEvent.Receipt, this._listenReciptEvent);

    if (this.refreshTimelineInterval) clearInterval(this.refreshTimelineInterval);
  }
}

export default RoomTimeline;
