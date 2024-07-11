import React from 'react';
import PropTypes from 'prop-types';

function SettingTile({ title, options = null, content = null, className = null }) {
  let colNumber = 12;
  if (options !== null) {
    colNumber = 9;
  }

  return (
    <li className={`list-group-item${typeof className === 'string' ? ` ${className}` : ''}`}>
      <div className="row">
        <div className={`col-md-${colNumber}`}>
          {typeof title === 'string' ? <small>{title}</small> : title}
          {content}
        </div>
        {options !== null && <div className="col-md-3 text-end">{options}</div>}
      </div>
    </li>
  );
}

SettingTile.propTypes = {
  title: PropTypes.node.isRequired,
  options: PropTypes.node,
  content: PropTypes.node,
  className: PropTypes.string,
};

export default SettingTile;
