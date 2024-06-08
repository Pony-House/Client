import React from 'react';
import PropTypes from 'prop-types';
import favIconManager from '../../../util/libs/favicon';

function NotificationBadge({
  alert = false,
  content = null,
  className = null,
  bgColor = 'bg',
  ignoreClass = false,
}) {
  const classes = ['badge', `bg-${bgColor}`, 'notification-badge'];
  if (className) classes.push(className);
  if (ignoreClass) classes.push('ignore-notification');

  let finalContent = '';
  if (alert || content !== null) {
    finalContent = content;
  } else {
    const cicleClass = `fa-solid fa-circle text-${bgColor}`;
    finalContent = <i className={cicleClass} />;
    classes.push('empty-badge');
  }

  favIconManager.checkerFavIcon();

  return <div className={classes.join(' ')}>{finalContent}</div>;
}

NotificationBadge.propTypes = {
  bgColor: PropTypes.string,
  ignoreClass: PropTypes.bool,
  alert: PropTypes.bool,
  className: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default NotificationBadge;
