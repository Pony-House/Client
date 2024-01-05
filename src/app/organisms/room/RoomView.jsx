import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import EventEmitter from 'events';

import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';

import RoomViewHeader from './RoomViewHeader';
import RoomViewContent from './RoomViewContent';
import RoomViewFloating from './RoomViewFloating';
import RoomViewInput from './RoomViewInput';
import RoomViewCmdBar from './RoomViewCmdBar';

const viewEvent = new EventEmitter();

function RoomView({
  roomTimeline,
  eventId,
  isUserList,
  roomItem,
  isGuest,
}) {

  const refcmdInput = useRef(null);
  const refRoomInput = useRef(null);
  const roomViewRef = useRef(null);

  // eslint-disable-next-line react/prop-types
  const { roomId, threadId } = roomTimeline;

  useEffect(() => {

    const settingsToggle = (isVisible) => {

      const roomView = $(roomViewRef.current);
      roomView.toggleClass('room-view--dropped');

      const roomViewContent = roomView.children().eq(1);

      if (isVisible) {
        setTimeout(() => {
          if (!navigation.isRoomSettings) return;
          roomViewContent.css('visibility', 'hidden');
        }, 200);
      } else roomViewContent.css('visibility', 'visible');

    };

    navigation.on(cons.events.navigation.ROOM_SETTINGS_TOGGLED, settingsToggle);
    return () => {
      navigation.removeListener(cons.events.navigation.ROOM_SETTINGS_TOGGLED, settingsToggle);
    };

  }, []);

  return <div className="room-view" ref={roomViewRef}>
    <RoomViewHeader roomId={roomId} threadId={threadId} roomItem={roomItem} isGuest={isGuest} />
    <div className="room-view__content-wrapper">
      <div className="room-view__scrollable">
        <RoomViewContent isUserList={isUserList} eventId={eventId} roomTimeline={roomTimeline} />
        <RoomViewFloating refRoomInput={refRoomInput} refcmdInput={refcmdInput} roomId={roomId} roomTimeline={roomTimeline} />
      </div>
      <div className="room-view__sticky">
        <RoomViewInput
          refRoomInput={refRoomInput}
          roomId={roomId}
          threadId={threadId}
          roomTimeline={roomTimeline}
          viewEvent={viewEvent}
        />
        <RoomViewCmdBar roomId={roomId} refcmdInput={refcmdInput} roomTimeline={roomTimeline} viewEvent={viewEvent} />
      </div>
    </div>
  </div>;

}

RoomView.defaultProps = {
  eventId: null,
  isGuest: false,
};
RoomView.propTypes = {
  roomTimeline: PropTypes.shape({}).isRequired,
  eventId: PropTypes.string,
  isGuest: PropTypes.bool,
};

export default RoomView;
