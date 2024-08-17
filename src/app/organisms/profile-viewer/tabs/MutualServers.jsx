import React from 'react';
import initMatrix from '@src/client/initMatrix';
import RoomSelector from '@src/app/molecules/room-selector/RoomSelector';
import { dfAvatarSize } from '@src/util/matrixUtil';
import { selectRoom, selectRoomMode, selectTab } from '@src/client/action/navigation';

function MutualServerTitle({ userId, roomId }) {
  const { userList } = initMatrix;
  const userData = userList.getUserRooms(userId);
  return (
    <>{`${String(userData ? userData.rooms.length + userData.spaces.length : '0')} Mutual Servers`}</>
  );
}

function MutualServerRender({ userId, requestClose }) {
  const { userList, mxcUrl } = initMatrix;
  const mx = initMatrix.matrixClient;

  const userData = userList.getUserRooms(userId);
  if (userData) {
    const total = userData.rooms.length + userData.spaces.length > 0;
    const openItem = (roomId, type) => {
      if (type === 'space') selectTab(roomId, true);
      else {
        selectRoomMode('room');
        selectRoom(roomId);
      }
      requestClose();
    };

    if (total > 0) {
      return (
        <>
          {userData.spaces.length > 0 ? (
            <>
              <div className="small text-gray ms-2 mb-1">Spaces</div>
              <ul className="mutual-servers m-0 p-0">
                {userData.spaces.map((roomId) => {
                  const room = mx.getRoom(roomId);

                  return (
                    <li key={`mutual_servers_space_${roomId}`} className="list-group-item">
                      <RoomSelector
                        key={`mutual_servers_${roomId}`}
                        name={room.name}
                        roomId={roomId}
                        animParentsCount={2}
                        imageSrc={mxcUrl.getAvatarUrl(room, dfAvatarSize, dfAvatarSize)}
                        imageAnimSrc={mxcUrl.getAvatarUrl(room)}
                        isUnread={false}
                        notificationCount={0}
                        isAlert={false}
                        onClick={() => openItem(roomId, 'space')}
                      />
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}

          {userData.rooms.length > 0 ? (
            <>
              {userData.spaces.length > 0 ? <hr className="mx-0 my-2 border-bg" /> : null}
              <div className="small text-gray ms-2 mb-1">Rooms</div>
              <ul className="mutual-servers m-0 p-0">
                {userData.rooms.map((roomId) => {
                  const room = mx.getRoom(roomId);

                  return (
                    <li key={`mutual_servers_room_${roomId}`} className="list-group-item">
                      <RoomSelector
                        key={`mutual_servers_${roomId}`}
                        name={room.name}
                        roomId={roomId}
                        animParentsCount={2}
                        imageSrc={mxcUrl.getAvatarUrl(room, dfAvatarSize, dfAvatarSize)}
                        imageAnimSrc={mxcUrl.getAvatarUrl(room)}
                        isUnread={false}
                        notificationCount={0}
                        isAlert={false}
                        onClick={() => openItem(roomId, 'room')}
                      />
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </>
      );
    }
  }

  return <center className="small">No room was found.</center>;
}

export default function MutualServersTab(menuBarItems, accountContent, existEthereum, userId) {
  const { userList } = initMatrix;
  const userData = userList.getUserRooms(userId);
  if (userData && userData.rooms.length + userData.spaces.length > 0)
    menuBarItems.push({
      menu: ({ roomId, userId }) => <MutualServerTitle roomId={roomId} userId={userId} />,
      render: ({ userId, closeDialog }) => (
        <MutualServerRender requestClose={closeDialog} userId={userId} />
      ),
    });
}
