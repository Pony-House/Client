import React from 'react';
import PropTypes from 'prop-types';

function Spinner({ size = '', style = 'spinner-border' }) {
  return (
    <div className={`${style} ${size}`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}

Spinner.propTypes = {
  style: PropTypes.string,
  size: PropTypes.string,
};

export default Spinner;
