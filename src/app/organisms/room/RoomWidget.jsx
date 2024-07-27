import React, { useState } from 'react';
import $ from 'jquery';

import Button from '@src/app/atoms/button/Button';
import Iframe from '@src/app/atoms/iframe/Iframe';

export default function RoomWidget() {
  const [topEmbedUrl, setTopEmbedUrl] = useState(null);
  const [expandTopIframe, setExpandTopIframe] = useState(false);

  if (expandTopIframe) $('body').addClass('roomviewer-top-iframe-expand-enabled');
  else $('body').removeClass('roomviewer-top-iframe-expand-enabled');

  return topEmbedUrl ? (
    <>
      <div className={`chatbox-top-embed-expand${expandTopIframe ? ' clicked' : ''}`}>
        <Button
          variant="primary"
          type="button"
          faSrc="fa-solid fa-expand"
          onClick={() => setExpandTopIframe(!expandTopIframe)}
        />
      </div>
      <Iframe
        className={`chatbox-top-embed${!expandTopIframe ? '' : ' expand-embed'}`}
        alt="room-widget"
        src={topEmbedUrl}
      />
    </>
  ) : null;
}
