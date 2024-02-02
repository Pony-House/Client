import React from 'react';

import PropTypes from 'prop-types';
import ReCAPTCHA from 'react-google-recaptcha';

import Text from '../../../atoms/text/Text';

import ProcessWrapper from './ProcessWrapper';

function Recaptcha({ message, sitekey, onChange }) {
  return (
    <ProcessWrapper>
      <div style={{ marginBottom: 'var(--sp-normal)' }}>
        <Text variant="s1" weight="medium">
          {message}
        </Text>
      </div>
      <ReCAPTCHA sitekey={sitekey} onChange={onChange} />
    </ProcessWrapper>
  );
}
Recaptcha.propTypes = {
  message: PropTypes.string.isRequired,
  sitekey: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Recaptcha;
