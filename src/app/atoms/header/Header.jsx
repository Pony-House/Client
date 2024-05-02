import React from 'react';
import PropTypes from 'prop-types';

function Header({ children, title = null, banner = '' }) {
  return (
    <nav
      className={`${banner ? 'banner-mode ' : ''}navbar navbar-expand navbar-nav p-0 w-100 d-block noselect border-bottom border-bg emoji-size-fix room-view-navbar`}
      style={{ backgroundImage: banner ? `url("${banner}")` : '' }}
    >
      <div className="container-fluid w-100">
        {typeof title === 'string' && <span className="navbar-brand">{title}</span>}
        <div className="header-room navbar-collapse py-1 px-2 w-100">{children}</div>
      </div>
    </nav>
  );
}

Header.propTypes = {
  banner: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export { Header };
