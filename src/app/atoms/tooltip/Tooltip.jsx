import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';

function Tooltip({
  className, placement, content, delay, children,
}) {

  const tooltip = (
    <BootstrapTooltip className={className}>{content}</BootstrapTooltip>
  );

  return (
    <OverlayTrigger placement={placement} overlay={tooltip}>
      {children}
    </OverlayTrigger>
  );

}

Tooltip.defaultProps = {
  placement: 'top',
  className: '',
  delay: [200, 0],
};

Tooltip.propTypes = {
  className: PropTypes.string,
  placement: PropTypes.string,
  content: PropTypes.node.isRequired,
  delay: PropTypes.arrayOf(PropTypes.number),
  children: PropTypes.node.isRequired,
};

export default Tooltip;
