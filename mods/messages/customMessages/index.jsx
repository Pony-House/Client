import React from 'react';
import './style.scss';

import HookshotFeeds from './HookshotFeeds';
import tinyAPI from '../../../src/util/mods';

export default function startMod() {
  tinyAPI.on('messageBody', (data, content) => {
    if (content['uk.half-shot.matrix-hookshot.feeds.item']) {
      const feedData = content['uk.half-shot.matrix-hookshot.feeds.item'];
      data.custom = <HookshotFeeds feedData={feedData} />;
    }
  });
}
