import React, { useEffect, useReducer, useState } from 'react';
import PropTypes from 'prop-types';

import moment, { momentFormat } from '@src/util/libs/momentjs';
import { getTimestampRules } from '@src/util/markdown';

import matrixAppearance from '../../../util/libs/appearance';
import Tooltip from '../tooltip/Tooltip';

function TimeFormat({
  className = null,
  intervalTimeout = 1000,
  timestamp = null,
  onChange = null,
  realTime = false,
  format = undefined,
  type = 'format',
  placement = null,
}) {
  const [, forceUpdate] = useReducer((count) => count + 1, 0);
  const now = moment(timestamp);

  useEffect(() => {
    const updateClock = () => forceUpdate();
    matrixAppearance.on('is24hours', updateClock);
    matrixAppearance.on('calendarFormat', updateClock);
    return () => {
      matrixAppearance.off('is24hours', updateClock);
      matrixAppearance.off('calendarFormat', updateClock);
    };
  });

  useEffect(() => {
    if (realTime) {
      const updateClock = () => forceUpdate();
      const tinyInterval = setInterval(updateClock, intervalTimeout);
      return () => {
        if (tinyInterval) clearInterval(tinyInterval);
      };
    }
  });

  if (onChange) onChange({ now });

  const result = (
    <time className={className} dateTime={now.toISOString()} type={type}>
      {now.format(format)}
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

TimeFormat.propTypes = {
  placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  className: PropTypes.string,
  format: PropTypes.string,
  type: PropTypes.string,
  intervalTimeout: PropTypes.number,
  timestamp: PropTypes.any.isRequired,
  onChange: PropTypes.func,
  realTime: PropTypes.bool,
};
export default TimeFormat;
