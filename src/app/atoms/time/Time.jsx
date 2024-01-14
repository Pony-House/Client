import React from 'react';
import PropTypes from 'prop-types';

import { isInSameDay } from '../../../util/common';
import moment, { momentFormat } from '../../../util/libs/momentjs';

const timeBase = (timestamp, fullTime) => {

  const date = new Date(timestamp);

  const formattedFullTime = moment(date).format(`DD MMMM YYYY, ${momentFormat.clock()}`);
  let formattedDate = formattedFullTime;

  if (!fullTime) {
    const compareDate = new Date();
    const isToday = isInSameDay(date, compareDate);
    compareDate.setDate(compareDate.getDate() - 1);
    const isYesterday = isInSameDay(date, compareDate);

    formattedDate = moment(date).format(isToday || isYesterday ? momentFormat.clock() : momentFormat.calendar());
    if (isYesterday) {
      formattedDate = `Yesterday, ${formattedDate}`;
    }
  }

  return { date, formattedFullTime, formattedDate };

};

function Time({ timestamp, fullTime, className }) {

  const { date, formattedFullTime, formattedDate } = timeBase(timestamp, fullTime);

  return <time
    className={className}
    dateTime={date.toISOString()}
    title={formattedFullTime}
  >
    {formattedDate}
  </time>;
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

  time.prop('dateTime', date.toISOString());
  time.prop('title', formattedFullTime);

  time.text(formattedDate);
  return time;

};

export { jqueryTime };
export default Time;
