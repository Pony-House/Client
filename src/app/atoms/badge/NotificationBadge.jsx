import React from 'react';
import PropTypes from 'prop-types';
import { checkerFavIcon } from '../../../util/libs/favicon';

function NotificationBadge({ alert, content, className, bgColor }) {

  const classes = ['badge', `bg-${bgColor}`, 'notification-badge'];
  if (className) classes.push(className);

  let finalContent = '';
  if (alert || content !== null) {
    finalContent = content;
  }

  else {
    const cicleClass = `fa-solid fa-circle text-${bgColor}`;
    finalContent = (<i className={cicleClass} />);
    classes.push('empty-badge');
  }

  checkerFavIcon();

  return (
    <div className={classes.join(' ')}>
      {finalContent}
    </div>
  );

}

NotificationBadge.defaultProps = {
  bgColor: 'bg',
  alert: false,
  content: null,
  className: null,
};

NotificationBadge.propTypes = {
  bgColor: PropTypes.string,
  alert: PropTypes.bool,
  className: PropTypes.string,
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

export default NotificationBadge;
