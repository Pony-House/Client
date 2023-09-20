import React, { useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

import initMatrix from '../../../client/initMatrix';
import { suffixRename } from '../../../util/common';

import Text from '../../atoms/text/Text';
import Input from '../../atoms/input/Input';
import Button from '../../atoms/button/Button';
import ImagePack from '../image-pack/ImagePack';
import { updateEmojiList } from '../../../client/action/navigation';
import { getCurrentState } from '../../../util/matrixUtil';

function useRoomPacks(room) {
  const mx = initMatrix.matrixClient;
  const [, forceUpdate] = useReducer((count) => count + 1, 0);

  const packEvents = getCurrentState(room).getStateEvents('im.ponies.room_emotes');
  const unUsablePacks = [];
  const usablePacks = packEvents.filter((mEvent) => {
    if (typeof mEvent.getContent()?.images !== 'object') {
      unUsablePacks.push(mEvent);
      return false;
    }
    return true;
  });

  useEffect(() => {
    const handleEvent = (event, state, prevEvent) => {
      if (event.getRoomId() !== room.roomId) return;
      if (event.getType() !== 'im.ponies.room_emotes') return;
      if (!prevEvent?.getContent()?.images || !event.getContent().images) {
        forceUpdate();
      }
    };

    mx.on('RoomState.events', handleEvent);
    return () => {
      mx.removeListener('RoomState.events', handleEvent);
    };
  }, [room, mx]);

  const isStateKeyAvailable = (key) => !getCurrentState(room).getStateEvents('im.ponies.room_emotes', key);

  const createPack = async (name) => {
    const packContent = {
      pack: { display_name: name },
      images: {},
    };
    let stateKey = '';
    if (unUsablePacks.length > 0) {
      const mEvent = unUsablePacks[0];
      stateKey = mEvent.getStateKey();
    } else {
      stateKey = packContent.pack.display_name.replace(/\s/g, '-');
      if (!isStateKeyAvailable(stateKey)) {
        stateKey = suffixRename(
          stateKey,
          isStateKeyAvailable,
        );
      }
    }
    await mx.sendStateEvent(room.roomId, 'im.ponies.room_emotes', packContent, stateKey);
    updateEmojiList(room.roomId);
  };

  const deletePack = async (stateKey) => {
    await mx.sendStateEvent(room.roomId, 'im.ponies.room_emotes', {}, stateKey);
    updateEmojiList(room.roomId);
  };

  return {
    usablePacks,
    createPack,
    deletePack,
  };
}

function RoomEmojis({ roomId, profileMode }) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);

  const { usablePacks, createPack, deletePack } = useRoomPacks(room);
  const canChange = getCurrentState(room).maySendStateEvent('im.ponies.emote_rooms', mx.getUserId());

  const handlePackCreate = (e) => {
    e.preventDefault();
    const { nameInput } = e.target;
    const name = nameInput.value.trim();
    if (name === '') return;
    nameInput.value = '';

    createPack(name);
  };

  return (
    <div className="card noselect mb-3">
      <ul className="list-group list-group-flush">

        {canChange && (
          <>

            <li className="list-group-item very-small text-gray">Create Pack</li>

            <li className="list-group-item">
              <form className="row" onSubmit={handlePackCreate}>

                <div className="col-10">
                  <div>
                    <Input name="nameInput" placeholder="Pack Name" required />
                  </div>
                </div>
                <div className="col-2">
                  <center className='h-100'><Button className='h-100' variant="primary" type="submit">Create pack</Button></center>
                </div>

              </form>
            </li>

          </>
        )}

        {
          usablePacks.length > 0
            ? usablePacks.reverse().map((mEvent) => (
              <ImagePack
                key={mEvent.getId()}
                roomId={roomId}
                stateKey={mEvent.getStateKey()}
                handlePackDelete={canChange ? deletePack : undefined}
              />
            )) : (
              <div className="room-emojis__empty">
                <Text>No emoji or sticker pack.</Text>
              </div>
            )
        }

      </ul>
    </div>
  );
}

RoomEmojis.propTypes = {
  roomId: PropTypes.string.isRequired,
  profileMode: PropTypes.bool,
};

export default RoomEmojis;
