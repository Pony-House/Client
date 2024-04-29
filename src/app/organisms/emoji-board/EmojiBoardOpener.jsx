import React, { useEffect, useRef } from 'react';

import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import settings from '../../../client/state/settings';

import ContextMenu from '../../atoms/context-menu/ContextMenu';
import EmojiBoard from './EmojiBoard';

let requestCallback = null;
let isEmojiBoardVisible = false;
function EmojiBoardOpener() {
  const scrollEmojisRef = useRef(null);
  const openerRef = useRef(null);
  const searchRef = useRef(null);
  const emojiBoardRef = useRef(null);

  function openEmojiBoard(roomId, cords, requestEmojiCallback, dom) {
    const opener = $(openerRef.current);
    $(emojiBoardRef.current).attr('board-type', dom);

    if (requestCallback !== null || isEmojiBoardVisible) {
      requestCallback = null;
      if (cords.detail === 0) opener.trigger('click');
      return;
    }

    opener.css('transform', `translate(${cords.x}px, ${cords.y}px)`);
    requestCallback = requestEmojiCallback;

    opener.trigger('click');
    setTimeout(() => {
      $(scrollEmojisRef.current).trigger('scroll');
    }, 500);
  }

  function afterEmojiBoardToggle(isVisible) {
    isEmojiBoardVisible = isVisible;

    if (isVisible) {
      if (!settings.isTouchScreenDevice) $(searchRef.current).focus();
    } else {
      setTimeout(() => {
        if (!isEmojiBoardVisible) requestCallback = null;
      }, 500);
    }
  }

  function addEmoji(emoji) {
    if (typeof requestCallback === 'function') requestCallback(emoji);
  }

  useEffect(() => {
    navigation.on(cons.events.navigation.EMOJIBOARD_OPENED, openEmojiBoard);
    return () => {
      navigation.removeListener(cons.events.navigation.EMOJIBOARD_OPENED, openEmojiBoard);
    };
  }, []);

  return (
    <ContextMenu
      className="emoji-board-base"
      content={
        <EmojiBoard
          onSelect={addEmoji}
          searchRef={searchRef}
          emojiBoardRef={emojiBoardRef}
          scrollEmojisRef={scrollEmojisRef}
        />
      }
      afterToggle={afterEmojiBoardToggle}
      render={(toggleMenu) => (
        <input
          ref={openerRef}
          onClick={toggleMenu}
          type="button"
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'transparent',
            position: 'absolute',
            top: 0,
            left: 0,
            padding: 0,
            border: 'none',
            visibility: 'hidden',
          }}
        />
      )}
    />
  );
}

export default EmojiBoardOpener;
