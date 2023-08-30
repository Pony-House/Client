import { selectRoom, selectRoomMode } from '../../client/action/navigation';
import initMatrix from '../../client/initMatrix';
import { hasDMWith, hasDevices } from '../../util/matrixUtil';

import * as roomActions from '../../client/action/room';
import { processMxidAndReason, MXC_REG, MXID_REG, ROOM_ID_ALIAS_REG, ROOM_ID_REG } from '.';

const rommCommands = {

    startdm: {
        category: 'default',
        sub_category: 'room',
        name: 'startdm',
        description: 'Start direct message with user. Example: /startdm userId1',
        exe: async (roomId, data) => {
            const mx = initMatrix.matrixClient;
            const rawIds = data.split(' ');
            const userIds = rawIds.filter((id) => id.match(MXID_REG) && id !== mx.getUserId());
            if (userIds.length === 0) return;
            if (userIds.length === 1) {
                const dmRoomId = hasDMWith(userIds[0]);
                if (dmRoomId) {
                    selectRoomMode('room');
                    selectRoom(dmRoomId);
                    return;
                }
            }
            const devices = await Promise.all(userIds.map(hasDevices));
            const isEncrypt = devices.every((hasDevice) => hasDevice);
            const result = await roomActions.createDM(userIds, isEncrypt);
            selectRoomMode('room');
            selectRoom(result.room_id);
        },
    },

    join: {
        category: 'default',
        sub_category: 'room',
        name: 'join',
        description: 'Join room with address. Example: /join address1 address2',
        exe: (roomId, data) => {
            const rawIds = data.split(' ');
            const roomIds = rawIds.filter((id) => id.match(ROOM_ID_ALIAS_REG));
            roomIds.map((id) => roomActions.join(id));
        },
    },

    leave: {
        category: 'default',
        sub_category: 'room',
        name: 'leave',
        description: 'Leave current room.',
        exe: (roomId, data) => {
            if (data.trim() === '') {
                roomActions.leave(roomId);
                return;
            }
            const rawIds = data.split(' ');
            const roomIds = rawIds.filter((id) => id.match(ROOM_ID_REG));
            roomIds.map((id) => roomActions.leave(id));
        },
    },

    invite: {
        category: 'default',
        sub_category: 'room',
        name: 'invite',
        description: 'Invite user to room. Example: /invite userId1 userId2 [-r reason]',
        exe: (roomId, data) => {
            const { userIds, reason } = processMxidAndReason(data);
            userIds.map((id) => roomActions.invite(roomId, id, reason));
        },
    },

    disinvite: {
        category: 'default',
        sub_category: 'room',
        name: 'disinvite',
        description: 'Disinvite user to room. Example: /disinvite userId1 userId2 [-r reason]',
        exe: (roomId, data) => {
            const { userIds, reason } = processMxidAndReason(data);
            userIds.map((id) => roomActions.kick(roomId, id, reason));
        },
    },

    kick: {
        category: 'default',
        sub_category: 'room',
        name: 'kick',
        description: 'Kick user from room. Example: /kick userId1 userId2 [-r reason]',
        exe: (roomId, data) => {
            const { userIds, reason } = processMxidAndReason(data);
            userIds.map((id) => roomActions.kick(roomId, id, reason));
        },
    },

    ban: {
        category: 'default',
        sub_category: 'room',
        name: 'ban',
        description: 'Ban user from room. Example: /ban userId1 userId2 [-r reason]',
        exe: (roomId, data) => {
            const { userIds, reason } = processMxidAndReason(data);
            userIds.map((id) => roomActions.ban(roomId, id, reason));
        },
    },

    unban: {
        category: 'default',
        sub_category: 'room',
        name: 'unban',
        description: 'Unban user from room. Example: /unban userId1 userId2',
        exe: (roomId, data) => {
            const rawIds = data.split(' ');
            const userIds = rawIds.filter((id) => id.match(MXID_REG));
            userIds.map((id) => roomActions.unban(roomId, id));
        },
    },

    myroomnick: {
        category: 'default',
        sub_category: 'room',
        name: 'myroomnick',
        description: 'Change nick in current room.',
        exe: (roomId, data) => {
            const nick = data.trim();
            if (nick === '') return;
            roomActions.setMyRoomNick(roomId, nick);
        },
    },

    myroomavatar: {
        category: 'default',
        sub_category: 'room',
        name: 'myroomavatar',
        description: 'Change profile picture in current room. Example /myroomavatar mxc://xyzabc',
        exe: (roomId, data) => {
            if (data.match(MXC_REG)) {
                roomActions.setMyRoomAvatar(roomId, data);
            }
        },
    },

    converttodm: {
        category: 'default',
        sub_category: 'room',
        name: 'converttodm',
        description: 'Convert room to direct message',
        exe: (roomId) => {
            roomActions.convertToDm(roomId);
        },
    },

    converttoroom: {
        category: 'default',
        sub_category: 'room',
        name: 'converttoroom',
        description: 'Convert direct message to room',
        exe: (roomId) => {
            roomActions.convertToRoom(roomId);
        },
    }

};

export default rommCommands;