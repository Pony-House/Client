import EventEmitter from 'events';
import { RoomEvent, RoomStateEvent } from 'matrix-js-sdk';

class UserList extends EventEmitter {
  constructor(matrixClient) {
    super();
    this.setMaxListeners(__ENV_APP__.MAX_LISTENERS);
    this.matrixClient = matrixClient;
    this.users = new Set();

    this._populateRooms();
    this._listenEvents();
  }

  _addUser(roomId, userId, user) {
    // console.log('Join user', roomId, user);
  }

  _removeUser(roomId, userId, user) {
    // console.log('Leave user', roomId, user);
  }

  _removeRoom(roomId) {
    // console.log('Remove Room', roomId);
  }

  _populateRooms() {
    const tinyThis = this;
    this.users.clear();
    this.matrixClient.getRooms().forEach((room) => {
      room.getJoinedMembers().forEach((member) => {
        tinyThis._addUser(room.roomId, member.user.userId, member.user);
      });
    });
  }

  _listenEvents() {
    const tinyThis = this;
    const mx = this.matrixClient;

    const memberManage = (roomId, event) => {
      const content = event.getContent();
      const userId = event.getStateKey();
      if (typeof userId === 'string' && userId.length > 0) {
        if (content.membership === 'join') tinyThis._addUser(roomId, userId, mx.getUser(userId));
        else tinyThis._removeUser(roomId, userId, mx.getUser(userId));
      }
    };

    mx.on(RoomEvent.MyMembership, async (room, membership) => {
      if (room && membership === 'join') {
        room.getJoinedMembers().forEach((member) => {
          tinyThis._addUser(room.roomId, member.user.userId, member.user);
        });
      } else tinyThis._removeRoom(room.roomId);
    });

    mx.on(RoomStateEvent.Members, (mEvent, state) => {
      if (mEvent.getType() === 'm.room.member') memberManage(state.roomId, mEvent);
    });

    mx.on(RoomStateEvent.NewMember, (mEvent, state) => {
      if (mEvent.getType() === 'm.room.member') memberManage(state.roomId, mEvent);
    });
  }
}
export default UserList;
