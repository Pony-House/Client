import React from 'react';

import PropTypes from 'prop-types';

function ProcessWrapper({ children, className }) {
  return <div className={`process-wrapper${className ? ` ${className}` : ''}`}>{children}</div>;
}
ProcessWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProcessWrapper;
