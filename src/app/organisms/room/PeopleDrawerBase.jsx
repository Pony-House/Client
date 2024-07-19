import React from 'react';
import PropTypes from 'prop-types';

import { Header } from '../../atoms/header/Header';

export default function PeopleDrawerBase({
  className = null,
  onMouseEnter = null,
  onMouseLeave = null,
  children,
  contentLeft,
  contentRight,
}) {
  return (
    <div
      className={`people-drawer${className ? ` ${className}` : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {contentLeft || contentRight ? (
        <Header>
          {contentLeft && <ul className="navbar-nav mr-auto pb-1">{contentLeft}</ul>}
          {contentRight && <ul className="navbar-nav ms-auto mb-0 small">{contentRight}</ul>}
        </Header>
      ) : null}
      {children}
    </div>
  );
}

PeopleDrawerBase.propTypes = {
  className: PropTypes.string,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  contentLeft: PropTypes.node,
  contentRight: PropTypes.node,
};
