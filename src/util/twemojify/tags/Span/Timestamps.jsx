import React from 'react';
import $ from 'jquery';

import tinyFixScrollChat from '@src/app/molecules/media/mediaFix';
import { getTimestampRules } from '@src/util/markdown';

import TimeFromNow from '@src/app/atoms/time/TimeFromNow';
import TimeFormat from '@src/app/atoms/time/TimeFormat';

const Timestamps = {
  jquery: function () {
    const el = $(this);
  },
  React: ({ attribs }) => {
    const timestampRules = getTimestampRules();
    const timestamp = Number(attribs['data-mx-timestamp']);
    const type = attribs['timestamp-type'];

    if (typeof timestampRules[type] === 'string') {
      return (
        <TimeFormat
          onChange={() => tinyFixScrollChat(50)}
          placement="top"
          className="mx-timestamp"
          format={timestampRules[type]}
          timestamp={timestamp}
          type={`mx-timestamp-${type}`}
        />
      );
    } else if (typeof timestampRules[type] === 'function') {
      return (
        <TimeFormat
          onChange={() => tinyFixScrollChat(50)}
          placement="top"
          className="mx-timestamp"
          format={timestampRules[type]()}
          timestamp={timestamp}
          type={`mx-timestamp-${type}`}
        />
      );
    } else if (type === 'R')
      return (
        <TimeFromNow
          onChange={() => tinyFixScrollChat(50)}
          placement="top"
          className="mx-timestamp"
          timestamp={timestamp}
        />
      );

    return null;
  },
};

export default Timestamps;
