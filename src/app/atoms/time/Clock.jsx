import React, { useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';

import moment, { momentFormat } from '@src/util/libs/momentjs';
import { getTimestampRules } from '@src/util/markdown';

import matrixAppearance from '../../../util/libs/appearance';
import Tooltip from '../tooltip/Tooltip';

function Clock({
  timezone = null,
  className = null,
  intervalTimeout = 1000,
  showSeconds = false,
  calendarFormat = null,
  onChange = null,
  placement = null,
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
  const textFormat = !calendarFormat ? timeText : calendarFormat.replace('{time}', timeText);

  if (onChange)
    onChange({
      format: textFormat,
      time: timeText,
      now,
    });

  const result = (
    <time className={className} type="clock" timezone={timezone}>
      {now.format(textFormat)}
    </time>
  );

  if (!placement) return result;
  const timestampRules = getTimestampRules();
  return (
    <Tooltip content={now.format(timestampRules.F())} placement={placement}>
      {result}
    </Tooltip>
  );
}

Clock.propTypes = {
  placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  className: PropTypes.string,
  intervalTimeout: PropTypes.number,
  showSeconds: PropTypes.bool,
  calendarFormat: PropTypes.string,
  timezone: PropTypes.string,
  onChange: PropTypes.func,
};
export default Clock;
