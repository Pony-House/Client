import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import moment, { momentFormat } from '@src/util/libs/momentjs';

import { isInSameDay } from '../../../util/common';
import matrixAppearance from '../../../util/libs/appearance';

const timeBase = (timestamp, fullTime) => {
  const date = new Date(timestamp);

  const formattedFullTime = moment(date).format(`DD MMMM YYYY, ${momentFormat.clock()}`);
  let formattedDate = formattedFullTime;

  if (!fullTime) {
    const compareDate = new Date();
    const isToday = isInSameDay(date, compareDate);
    compareDate.setDate(compareDate.getDate() - 1);
    const isYesterday = isInSameDay(date, compareDate);

    formattedDate = moment(date).format(
      isToday || isYesterday ? momentFormat.clock() : momentFormat.calendar(),
    );
    if (isYesterday) {
      formattedDate = `Yesterday, ${formattedDate}`;
    }
  }

  return { date, formattedFullTime, formattedDate };
};

function Time({ timestamp, fullTime, className }) {
  const [, forceUpdate] = useReducer((count) => count + 1, 0);
  const { date, formattedFullTime, formattedDate } = timeBase(timestamp, fullTime);

  useEffect(() => {
    const updateClock = () => forceUpdate();
    matrixAppearance.on('is24hours', updateClock);
    matrixAppearance.on('calendarFormat', updateClock);

    return () => {
      matrixAppearance.off('is24hours', updateClock);
      matrixAppearance.off('calendarFormat', updateClock);
    };
  });

  return (
    <time className={className} dateTime={date.toISOString()} title={formattedFullTime}>
      {formattedDate}
    </time>
  );
}

Time.defaultProps = {
  fullTime: false,
  className: '',
};

Time.propTypes = {
  className: PropTypes.string,
  timestamp: PropTypes.number.isRequired,
  fullTime: PropTypes.bool,
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
