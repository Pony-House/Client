import React from 'react';

import PropTypes from 'prop-types';

function ProcessWrapper({ children }) {
  return <div className="process-wrapper">{children}</div>;
}
ProcessWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProcessWrapper;
