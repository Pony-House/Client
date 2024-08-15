import React, { useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';

import moment, { momentFormat } from '@src/util/libs/momentjs';
import matrixAppearance from '../../../util/libs/appearance';

function TimeFromNow({ className = null, intervalTimeout = 1000, timestamp = null }) {
  const [, forceUpdate] = useReducer((count) => count + 1, 0);
  const now = moment(timestamp);

  useEffect(() => {
    const updateClock = () => forceUpdate();
    const tinyInterval = setInterval(updateClock, intervalTimeout);

    matrixAppearance.on('is24hours', updateClock);
    matrixAppearance.on('calendarFormat', updateClock);
    return () => {
      if (tinyInterval) clearInterval(tinyInterval);
      matrixAppearance.off('is24hours', updateClock);
      matrixAppearance.off('calendarFormat', updateClock);
    };
  });

  return (
    <time className={className} dateTime={now.toISOString()} type="fromnow">
      {now.fromNow()}
    </time>
  );
}

TimeFromNow.propTypes = {
  className: PropTypes.string,
  intervalTimeout: PropTypes.number,
  timestamp: PropTypes.number.isRequired,
};
export default TimeFromNow;
