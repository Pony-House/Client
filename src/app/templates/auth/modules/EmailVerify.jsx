import React from 'react';

import PropTypes from 'prop-types';
import Button from '../../../atoms/button/Button';
import Text from '../../../atoms/text/Text';

import ProcessWrapper from './ProcessWrapper';

function EmailVerify({ email, onContinue }) {
  return (
    <ProcessWrapper>
      <div style={{ margin: 'var(--sp-normal)', maxWidth: '450px' }}>
        <Text variant="h2" weight="medium">
          Verify email
        </Text>
        <div style={{ margin: 'var(--sp-normal) 0' }}>
          <Text variant="b1">
            {'Please check your email '}
            <strong>{`(${email})`}</strong>
            {' and validate before continuing further.'}
          </Text>
        </div>
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </ProcessWrapper>
  );
}
EmailVerify.propTypes = {
  email: PropTypes.string.isRequired,
};

export default EmailVerify;
