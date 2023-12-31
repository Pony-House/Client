import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

import EventEmitter from 'events';
import renderAvatar from '../../../app/atoms/avatar/render';
import { cssColorMXID } from '../../../util/colorMXID';
import { selectRoom } from '../../action/navigation';
import cons from '../cons';
import navigation from '../navigation';
import settings from '../settings';
import { updateName } from '../../../util/roomName';

import { html, plain } from '../../../util/markdown';
import { getAccountStatus } from '../../../app/organisms/navigation/ProfileAvatarMenu';
import { messageIsClassicCrdt } from '../../../util/libs/crdt';
import { checkerFavIcon } from '../../../util/libs/favicon';
import { getPrivacyRefuseRoom } from '../../../app/organisms/navigation/Sidebar/InviteSidebar';

const soundFiles = {
  notification: new Audio('./sound/notification.ogg'),
  invite: new Audio('./sound/invite.ogg'),
  micro_on: new Audio('./sound/micro_on.ogg'),
  micro_off: new Audio('./sound/micro_off.ogg'),
};

function isNotifEvent(mEvent) {
  const eType = mEvent.getType();
  if (!cons.supportEventTypes.includes(eType)) return false;
  if (eType === 'm.room.member') return false;

  if (mEvent.isRedacted()) return false;
  if (mEvent.getRelation()?.rel_type === 'm.replace') return false;

  return true;
}

function isMutedRule(rule) {
  return rule.actions[0] === 'dont_notify' && rule.conditions[0].kind === 'event_match';
}

function findMutedRule(overrideRules, roomId) {
  return overrideRules.find((rule) => (
    rule.rule_id === roomId
    && isMutedRule(rule)
  ));
}

class Notifications extends EventEmitter {
  constructor(roomList) {

    super();

    this.initialized = false;
    this.matrixClient = roomList.matrixClient;
    this.roomList = roomList;

    this.roomIdToNoti = new Map();
    this.roomIdToPopupNotis = new Map();
    this.eventIdToPopupNoti = new Map();

    // this._initNoti();
    this._listenEvents();

    // Ask for permission by default after loading
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.checkPermissions().then(async permStatus => {

        if (permStatus.display === 'prompt') {
          permStatus = await LocalNotifications.requestPermissions();
        }

        if (permStatus.display !== 'granted') {
          throw new Error('User denied mobile permissions!');
        }

        // return LocalNotifications.registerActionTypes({types: {}});
        return true;

      });
    } else {
      window.Notification?.requestPermission();
    }

  }

  async _initNoti() {

    this.initialized = false;
    this.roomIdToNoti = new Map();

    const addNoti = (roomId) => {
      const room = this.matrixClient.getRoom(roomId);
      if (this.getNotiType(room.roomId) === cons.notifs.MUTE) return;
      if (this.doesRoomHaveUnread(room) === false) return;

      const total = room.getUnreadNotificationCount('total');
      const highlight = room.getUnreadNotificationCount('highlight');
      this._setNoti(room.roomId, total ?? 0, highlight ?? 0);
    };
    [...this.roomList.rooms].forEach(addNoti);
    [...this.roomList.directs].forEach(addNoti);

    this.initialized = true;
    // this._updateFavicon();

  }

  doesRoomHaveUnread(room) {

    const userId = this.matrixClient.getUserId();
    const readUpToId = room.getEventReadUpTo(userId);
    const liveEvents = room.getLiveTimeline().getEvents();

    if (liveEvents[liveEvents.length - 1]?.getSender() === userId) {
      return false;
    }

    for (let i = liveEvents.length - 1; i >= 0; i -= 1) {
      const event = liveEvents[i];
      if (event.getId() === readUpToId) return false;
      if (isNotifEvent(event)) return true;
    }

    return true;

  }

  getNotiType(roomId) {

    const mx = this.matrixClient;
    let pushRule;

    try {
      pushRule = mx.getRoomPushRule('global', roomId);
    } catch {
      pushRule = undefined;
    }

    if (pushRule === undefined) {
      const overrideRules = mx.getAccountData('m.push_rules')?.getContent()?.global?.override;
      if (overrideRules === undefined) return cons.notifs.DEFAULT;

      const isMuted = findMutedRule(overrideRules, roomId);

      return isMuted ? cons.notifs.MUTE : cons.notifs.DEFAULT;
    }

    if (pushRule.actions[0] === 'notify') return cons.notifs.ALL_MESSAGES;
    return cons.notifs.MENTIONS_AND_KEYWORDS;

  }

  getNoti(roomId) {
    return this.roomIdToNoti.get(roomId) || { total: 0, highlight: 0, from: null };
  }

  getTotalNoti(roomId) {
    const { total } = this.getNoti(roomId);
    return total;
  }

  getHighlightNoti(roomId) {
    const { highlight } = this.getNoti(roomId);
    return highlight;
  }

  getFromNoti(roomId) {
    const { from } = this.getNoti(roomId);
    return from;
  }

  hasNoti(roomId) {
    return this.roomIdToNoti.has(roomId);
  }

  deleteNoti(roomId) {
    if (this.hasNoti(roomId)) {
      const noti = this.getNoti(roomId);
      this._deleteNoti(roomId, noti.total, noti.highlight);
    }
  }

  _setNoti(roomId, total, highlight) {

    const addNoti = (id, t, h, fromId) => {
      const prevTotal = this.roomIdToNoti.get(id)?.total ?? null;
      const noti = this.getNoti(id);

      noti.total += t;
      noti.highlight += h;

      if (fromId) {
        if (noti.from === null) noti.from = new Set();
        noti.from.add(fromId);
      }
      this.roomIdToNoti.set(id, noti);
      this.emit(cons.events.notifications.NOTI_CHANGED, id, noti.total, prevTotal);
    };

    const noti = this.getNoti(roomId);
    const addT = (highlight > total ? highlight : total) - noti.total;
    const addH = highlight - noti.highlight;
    if (addT < 0 || addH < 0) return;

    addNoti(roomId, addT, addH);
    const allParentSpaces = this.roomList.getAllParentSpaces(roomId);
    allParentSpaces.forEach((spaceId) => {
      addNoti(spaceId, addT, addH, roomId);
    });

    // this._updateFavicon();

  }

  _deleteNoti(roomId, total, highlight) {

    const removeNoti = (id, t, h, fromId) => {

      if (this.roomIdToNoti.has(id) === false) return;

      const noti = this.getNoti(id);
      const prevTotal = noti.total;
      noti.total -= t;
      noti.highlight -= h;

      if (noti.total < 0) {
        noti.total = 0;
        noti.highlight = 0;
      }

      if (fromId && noti.from !== null) {
        if (!this.hasNoti(fromId)) noti.from.delete(fromId);
      }

      if (noti.from === null || noti.from.size === 0) {
        this.roomIdToNoti.delete(id);
        this.emit(cons.events.notifications.FULL_READ, id);
        this.emit(cons.events.notifications.NOTI_CHANGED, id, null, prevTotal);
      } else {
        this.roomIdToNoti.set(id, noti);
        this.emit(cons.events.notifications.NOTI_CHANGED, id, noti.total, prevTotal);
      }

    };

    removeNoti(roomId, total, highlight);
    const allParentSpaces = this.roomList.getAllParentSpaces(roomId);
    allParentSpaces.forEach((spaceId) => {
      removeNoti(spaceId, total, highlight, roomId);
    });

    // this._updateFavicon();

  }

  async _displayPopupNoti(mEvent, room) {

    // Favicon
    checkerFavIcon();

    // Data Prepare
    const userStatus = getAccountStatus('status');
    if (!settings.showNotifications && !settings.isNotificationSounds) return;

    // Actions
    const actions = this.matrixClient.getPushActionsForEvent(mEvent);
    if (!actions?.notify) return;

    // Check Window
    if (
      (!__ENV_APP__.ELECTRON_MODE || typeof window.getElectronShowStatus !== 'function' || window.getElectronShowStatus()) &&
      !$('body').hasClass('modal-open') &&
      navigation.selectedRoomId === room.roomId &&
      document.visibilityState === 'visible' &&
      !$('body').hasClass('windowHidden')
    ) return;

    if (userStatus === 'dnd' || userStatus === '🔴') return;

    // Encrypted
    if (mEvent.isEncrypted()) {
      await mEvent.attemptDecryption(this.matrixClient.getCrypto());
    }

    // Show Notification
    if (settings.showNotifications) {
      let title;
      if (!mEvent.sender || room.name === mEvent.sender.name) {
        title = room.name;
      } else if (mEvent.sender) {
        title = `${mEvent.sender.name} (${room.name})`;
      }

      updateName(room);
      if (room.nameCinny) {

        if (typeof room.nameCinny.category === 'string') {
          title = `(${room.nameCinny.category}) - ${title}`;
        }

      }

      const iconSize = 36;
      const icon = await renderAvatar({
        text: mEvent.sender.name,
        bgColor: cssColorMXID(mEvent.getSender()),
        imageSrc: mEvent.sender?.getAvatarUrl(this.matrixClient.baseUrl, iconSize, iconSize, 'crop'),
        size: iconSize,
        borderRadius: 8,
        scale: 8,
      });

      const content = mEvent.getContent();

      const state = { kind: 'notification', onlyPlain: true };
      let body;
      if (content.format === 'org.matrix.custom.html') {
        body = html(content.formatted_body, state);
      } else {
        body = plain(content.body, state);
      }

      // Android Mode
      if (Capacitor.isNativePlatform()) {

        /* 
        const noti = await LocalNotifications.schedule({notifications: [
          {
            body: body.plain,
            sound: './sound/notification.ogg',
            smallIcon: icon,
            largeIcon: icon,
          }
        ]});
        */

      }

      // Browser and Desktop
      else {

        // Prepare Data
        const notiData = {
          title,
          body: body.plain,
          icon,
          tag: mEvent.getId(),
        };

        // Silent Mode
        let noti;
        if (__ENV_APP__.ELECTRON_MODE) {
          notiData.silent = true;
          noti = await window.desktopNotification(notiData);
        } else {
          notiData.silent = settings.isNotificationSounds;
          noti = new window.Notification(title, notiData);
        }

        // Play Notification
        if (__ENV_APP__.ELECTRON_MODE) {

          if (settings.isNotificationSounds) {
            noti.on('show', () => this._playNotiSound());
          }

          noti.on('click', () => {
            selectRoom(room.roomId, mEvent.getId(), null, true);
            window.focusAppWindow();
          });

        } else {

          if (settings.isNotificationSounds) {
            noti.onshow = () => this._playNotiSound();
          }

          noti.onclick = () => selectRoom(room.roomId, mEvent.getId(), null, true);

        }

        // Set Event
        this.eventIdToPopupNoti.set(mEvent.getId(), noti);
        if (this.roomIdToPopupNotis.has(room.roomId)) {
          this.roomIdToPopupNotis.get(room.roomId).push(noti);
        } else {
          this.roomIdToPopupNotis.set(room.roomId, [noti]);
        }

        // Send Notification
        if (__ENV_APP__.ELECTRON_MODE) {
          noti.show();
        }

      }

    }

    // Notification Sound Play
    else {
      this._playNotiSound();
    }

  }

  _deletePopupNoti(eventId) {
    this.eventIdToPopupNoti.get(eventId)?.close();
    this.eventIdToPopupNoti.delete(eventId);
  }

  _deletePopupRoomNotis(roomId) {

    this.roomIdToPopupNotis.get(roomId)?.forEach((n) => {
      this.eventIdToPopupNoti.delete(n.tag);
      n.close();
    });

    this.roomIdToPopupNotis.delete(roomId);

  }

  _playNotiSound() {

    if (!this._notiAudio) {
      this._notiAudio = soundFiles.notification;
    }

    this._notiAudio.play();

  }

  _playInviteSound() {

    if (!this._inviteAudio) {
      this._inviteAudio = soundFiles.invite;
    }

    this._inviteAudio.play();

  }

  _listenEvents() {

    this.matrixClient.on('Room.timeline', (mEvent, room) => {

      if (mEvent.isRedaction()) this._deletePopupNoti(mEvent.event.redacts);

      if (messageIsClassicCrdt(mEvent)) return;
      if (room.isSpaceRoom()) return;
      if (!isNotifEvent(mEvent)) return;

      const liveEvents = room.getLiveTimeline().getEvents();

      const lastTimelineEvent = liveEvents[liveEvents.length - 1];
      if (lastTimelineEvent.getId() !== mEvent.getId()) return;
      if (mEvent.getSender() === this.matrixClient.getUserId()) return;

      const total = room.getUnreadNotificationCount('total');
      const highlight = room.getUnreadNotificationCount('highlight');

      if (this.getNotiType(room.roomId) === cons.notifs.MUTE) {
        this.deleteNoti(room.roomId, total ?? 0, highlight ?? 0);
        return;
      }

      this._setNoti(room.roomId, total ?? 0, highlight ?? 0);

      if (this.matrixClient.getSyncState() === 'SYNCING') {
        this._displayPopupNoti(mEvent, room);
      }

    });

    this.matrixClient.on('accountData', (mEvent, oldMEvent) => {
      if (mEvent.getType() === 'm.push_rules') {

        const override = mEvent?.getContent()?.global?.override;
        const oldOverride = oldMEvent?.getContent()?.global?.override;
        if (!override || !oldOverride) return;

        const isMuteToggled = (rule, otherOverride) => {
          const roomId = rule.rule_id;
          const room = this.matrixClient.getRoom(roomId);
          if (room === null) return false;
          if (room.isSpaceRoom()) return false;

          const isMuted = isMutedRule(rule);
          if (!isMuted) return false;
          const isOtherMuted = findMutedRule(otherOverride, roomId);
          if (isOtherMuted) return false;
          return true;
        };

        const mutedRules = override.filter((rule) => isMuteToggled(rule, oldOverride));
        const unMutedRules = oldOverride.filter((rule) => isMuteToggled(rule, override));

        mutedRules.forEach((rule) => {
          this.emit(cons.events.notifications.MUTE_TOGGLED, rule.rule_id, true);
          this.deleteNoti(rule.rule_id);
        });

        unMutedRules.forEach((rule) => {
          this.emit(cons.events.notifications.MUTE_TOGGLED, rule.rule_id, false);
          const room = this.matrixClient.getRoom(rule.rule_id);
          if (!this.doesRoomHaveUnread(room)) return;
          const total = room.getUnreadNotificationCount('total');
          const highlight = room.getUnreadNotificationCount('highlight');
          this._setNoti(room.roomId, total ?? 0, highlight ?? 0);
        });

      }
    });

    this.matrixClient.on('Room.receipt', (mEvent, room) => {

      if (mEvent.getType() !== 'm.receipt' || room.isSpaceRoom()) return;
      const content = mEvent.getContent();
      const userId = this.matrixClient.getUserId();

      Object.keys(content).forEach((eventId) => {
        Object.entries(content[eventId]).forEach(([receiptType, receipt]) => {
          if (!cons.supportReceiptTypes.includes(receiptType)) return;
          if (Object.keys(receipt || {}).includes(userId)) {
            this.deleteNoti(room.roomId);
            this._deletePopupRoomNotis(room.roomId);
          }
        });
      });

    });

    this.matrixClient.on('Room.myMembership', (room, membership) => {

      if (membership === 'leave' && this.hasNoti(room.roomId)) {
        this.deleteNoti(room.roomId);
      }

      if (membership === 'invite' && !getPrivacyRefuseRoom(null, room)) {
        this._playInviteSound();
      }

    });
  }
}

export function getSound(file) {
  if (soundFiles && soundFiles[file]) {
    return soundFiles[file];
  }
};

export default Notifications;
