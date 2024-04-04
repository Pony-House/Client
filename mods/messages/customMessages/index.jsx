import React from 'react';
import tinyAPI from '@src/util/mods';

import './style.scss';

import HookshotFeeds from './HookshotFeeds';

export default function startMod() {
  tinyAPI.on('messageBody', (data, content, info) => {
    if (content['uk.half-shot.matrix-hookshot.feeds.item']) {
      const feedData = content['uk.half-shot.matrix-hookshot.feeds.item'];
      data.custom = (
        <HookshotFeeds feedData={feedData} roomId={info.roomId} threadId={info.threadId} />
      );
    }
  });
}
