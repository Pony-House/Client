import React from 'react';
import PropTypes from 'prop-types';

const ScrollView = React.forwardRef(
  ({ horizontal, vertical, autoHide, invisible, onScroll, children, className, id }, ref) => {
    let scrollbarClasses = '';
    if (horizontal) scrollbarClasses += ' scrollbar__h';
    if (vertical) scrollbarClasses += ' scrollbar__v';
    if (autoHide) scrollbarClasses += ' scrollbar--auto-hide';
    if (invisible) scrollbarClasses += ' scrollbar--invisible';
    if (className) scrollbarClasses += ` ${className}`;
    return (
      <div onScroll={onScroll} ref={ref} id={id} className={`scrollbar${scrollbarClasses}`}>
        {children}
      </div>
    );
  },
);

ScrollView.defaultProps = {
  id: null,
  className: null,
  horizontal: false,
  vertical: true,
  autoHide: false,
  invisible: false,
  onScroll: null,
};

ScrollView.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  horizontal: PropTypes.bool,
  vertical: PropTypes.bool,
  autoHide: PropTypes.bool,
  invisible: PropTypes.bool,
  onScroll: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default ScrollView;
