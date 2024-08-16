import React, { useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';

import moment, { momentFormat } from '@src/util/libs/momentjs';
import { getTimestampRules } from '@src/util/markdown';

import matrixAppearance from '../../../util/libs/appearance';
import Tooltip from '../tooltip/Tooltip';

function TimeFromNow({
  className = null,
  intervalTimeout = 1000,
  timestamp = null,
  onChange = null,
  placement = null,
}) {
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

  if (onChange)
    onChange({
      now,
    });

  const result = (
    <time className={className} dateTime={now.toISOString()} type="fromnow">
      {now.fromNow()}
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

TimeFromNow.propTypes = {
  placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  className: PropTypes.string,
  intervalTimeout: PropTypes.number,
  timestamp: PropTypes.any.isRequired,
  onChange: PropTypes.func,
};
export default TimeFromNow;
