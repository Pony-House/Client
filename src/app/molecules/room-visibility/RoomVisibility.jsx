import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import initMatrix from '../../../client/initMatrix';
import { getCurrentState } from '../../../util/matrixUtil';

import RadioButton from '../../atoms/button/RadioButton';
import { MenuItem } from '../../atoms/context-menu/ContextMenu';

const visibility = {
  INVITE: 'invite',
  RESTRICTED: 'restricted',
  PUBLIC: 'public',
};

function setJoinRule(roomId, type) {
  const mx = initMatrix.matrixClient;
  let allow;
  if (type === visibility.RESTRICTED) {
    const currentState = getCurrentState(mx.getRoom(roomId));
    const mEvent = currentState.getStateEvents('m.space.parent')[0];
    if (!mEvent) return Promise.resolve(undefined);

    allow = [
      {
        room_id: mEvent.getStateKey(),
        type: 'm.room_membership',
      },
    ];
  }

  return mx.sendStateEvent(roomId, 'm.room.join_rules', {
    join_rule: type,
    allow,
  });
}

function useVisibility(roomId) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);

  const [activeType, setActiveType] = useState(room.getJoinRule());
  useEffect(() => {
    setActiveType(room.getJoinRule());
  }, [roomId]);

  const setNotification = useCallback(
    (item) => {
      if (item.type === activeType.type) return;
      setActiveType(item.type);
      setJoinRule(roomId, item.type);
    },
    [activeType, roomId],
  );

  return [activeType, setNotification];
}

function RoomVisibility({ roomId }) {
  const [activeType, setVisibility] = useVisibility(roomId);
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  const currentState = getCurrentState(room);

  const noSpaceParent = currentState.getStateEvents('m.space.parent').length === 0;
  const mCreate = currentState.getStateEvents('m.room.create')[0]?.getContent();
  const roomVersion = Number(mCreate?.room_version ?? 0);

  const myPowerlevel = room.getMember(mx.getUserId())?.powerLevel || 0;
  const canChange = getCurrentState(room).hasSufficientPowerLevelFor('state_default', myPowerlevel);

  const items = [
    {
      className: 'text-start',
      text: 'Private (invite only)',
      type: visibility.INVITE,
      unsupported: false,
    },
    {
      className: 'text-start',
      text:
        roomVersion < 8
          ? 'Restricted (unsupported: required room upgrade)'
          : 'Restricted (space member can join)',
      type: visibility.RESTRICTED,
      unsupported: roomVersion < 8 || noSpaceParent,
    },
    {
      className: 'text-start',
      text: 'Public (anyone can join)',
      type: visibility.PUBLIC,
      unsupported: false,
    },
  ];

  return items.map((item) => {
    const variant = `${item.className} ${activeType === item.type ? 'btn-text-success' : ''}`;

    return (
      <MenuItem
        className={variant}
        variant="link btn-bg"
        key={item.type}
        iconSrc={item.iconSrc}
        onClick={() => setVisibility(item)}
        disabled={!canChange || item.unsupported}
      >
        {item.text}
        <span className="ms-4 float-end">
          <RadioButton isActive={activeType === item.type} />
        </span>
      </MenuItem>
    );
  });
}

RoomVisibility.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default RoomVisibility;
