# Edit Help

If you are a developer interested in contributing to the project, I'll let the PATH of the recommended files to be modified below.

## Message Data

    Media:

    src/app/molecules/media
    src/app/organisms/navigation/DrawerHeader.scss
    src/app/atoms/text/Text.scss

    src/app/organisms/room/RoomViewInput.jsx

    Room:

    src/app/molecules/room-profile/RoomProfile.jsx
    src/app/molecules/room-permissions/RoomPermissions.jsx

    Message:

    src/app/molecules/message

    src/app/organisms/navigation/Selector.jsx

    src/util/markdown.js
    src/util/sanitize.js

    Scroll:

    _updateTopBottomMsg
    scrollToBottom
    src/app/organisms/room/TimelineScroll.js
    ROOM_SELECTED

## Modal Detector

    setIsRawModalVisible
    isRawModalVisible

## Input send message manager

    src/app/organisms/room/RoomViewInput.jsx

## Timeline

    src/client/state/RoomTimeline.js

room.getLiveTimeline().getEvents(EventTimeline.FORWARDS)
