import React from 'react';

import PropTypes from 'prop-types';
import Text from '../../atoms/text/Text';
import Spinner from '../../atoms/spinner/Spinner';

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