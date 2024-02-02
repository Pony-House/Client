import React from 'react';

import PropTypes from 'prop-types';
import Text from '../../../atoms/text/Text';
import Spinner from '../../../atoms/spinner/Spinner';

import ProcessWrapper from './ProcessWrapper';

function LoadingScreen({ message }) {
  return (
    <ProcessWrapper>
      <Spinner />
      <div style={{ marginTop: 'var(--sp-normal)' }}>
        <Text variant="b1">{message}</Text>
      </div>
    </ProcessWrapper>
  );
}
LoadingScreen.propTypes = {
  message: PropTypes.string.isRequired,
};

export default LoadingScreen;
