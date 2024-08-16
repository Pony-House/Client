import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

import moment, { momentFormat } from '@src/util/libs/momentjs';
import { getTimestampRules } from '@src/util/markdown';

import { isInSameDay } from '../../../util/common';
import matrixAppearance from '../../../util/libs/appearance';
import Tooltip from '../tooltip/Tooltip';

const timeBase = (timestamp, fullTime) => {
  const date = new Date(timestamp);

  const momentNow = moment(date);
  const formattedFullTime = momentNow.format(`DD MMMM YYYY, ${momentFormat.clock()}`);
  let formattedDate = formattedFullTime;

  if (!fullTime) {
    const compareDate = new Date();
    const isToday = isInSameDay(date, compareDate);
    compareDate.setDate(compareDate.getDate() - 1);
    const isYesterday = isInSameDay(date, compareDate);

    formattedDate = momentNow.format(
      isToday || isYesterday ? momentFormat.clock() : momentFormat.calendar(),
    );
    if (isYesterday) {
      formattedDate = `Yesterday, ${formattedDate}`;
    }
  }

  return { date, formattedFullTime, formattedDate, momentNow };
};

function Time({
  timestamp,
  fullTime = false,
  className = '',
  intervalTimeout = 1000,
  onChange = null,
  placement = null,
}) {
  const [, forceUpdate] = useReducer((count) => count + 1, 0);
  const { date, formattedFullTime, formattedDate, momentNow } = timeBase(timestamp, fullTime);

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
      date,
      formattedFullTime,
      formattedDate,
    });

  const result = (
    <time
      className={className}
      dateTime={date.toISOString()}
      title={formattedFullTime}
      type="default"
    >
      {formattedDate}
    </time>
  );

  if (!placement) return result;
  const timestampRules = getTimestampRules();
  return (
    <Tooltip content={momentNow.format(timestampRules.F())} placement={placement}>
      {result}
    </Tooltip>
  );
}

Time.propTypes = {
  placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  intervalTimeout: PropTypes.number,
  className: PropTypes.string,
  timestamp: PropTypes.number.isRequired,
  fullTime: PropTypes.bool,
  onChange: PropTypes.func,
};

function jqueryTime(timestamp, fullTime, className) {
  const { date, formattedFullTime, formattedDate } = timeBase(timestamp, fullTime);
  const time = $('<time>', { class: className });

  if (date && date.isValid()) time.prop('dateTime', date.toISOString());
  time.prop('title', formattedFullTime);

  time.text(formattedDate);
  return time;
}

export { jqueryTime };
export default Time;
