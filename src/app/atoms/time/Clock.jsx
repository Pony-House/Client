import React, { useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';

import moment, { momentFormat } from '@src/util/libs/momentjs';
import matrixAppearance from '../../../util/libs/appearance';

function Clock({
  timezone = null,
  className = null,
  intervalTimeout = 1000,
  showSeconds = false,
  calendarFormat = null,
}) {
  const getNow = () => (timezone ? moment.tz(timezone) : moment());

  const [, forceUpdate] = useReducer((count) => count + 1, 0);
  const [now, setNow] = useState(getNow());

  useEffect(() => {
    const clockUpdater = () => setNow(getNow());
    const tinyInterval = setInterval(clockUpdater, intervalTimeout);

    const updateClock = () => forceUpdate();
    matrixAppearance.on('is24hours', updateClock);
    matrixAppearance.on('calendarFormat', updateClock);
    return () => {
      if (tinyInterval) clearInterval(tinyInterval);
      matrixAppearance.off('is24hours', updateClock);
      matrixAppearance.off('calendarFormat', updateClock);
    };
  });

  const timeText = momentFormat[!showSeconds ? 'clock' : 'clock2']();

  return (
    <time className={className}>
      {now.format(!calendarFormat ? timeText : calendarFormat.replace('{time}', timeText))}
    </time>
  );
}

Clock.propTypes = {
  className: PropTypes.string,
  intervalTimeout: PropTypes.number,
  showSeconds: PropTypes.bool,
  calendarFormat: PropTypes.string,
  timezone: PropTypes.string,
};
export default Clock;
