import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Prepare extends Component {
  static propTypes = {
    loadingText: PropTypes.string,
    isDark: PropTypes.bool,
    preparingComp: PropTypes.any,
  };

  render() {
    const { loadingText = 'Preparing', isDark, preparingComp } = this.props;
    const preparing = preparingComp || <div className={`prepare`}>{loadingText}</div>;

    return (
      <div className={`player r-howler ${isDark ? 'dark-themed' : 'light-themed'}`}>
        {preparing}
      </div>
    );
  }
}
