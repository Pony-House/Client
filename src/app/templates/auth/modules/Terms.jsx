import React from 'react';

import PropTypes from 'prop-types';
import Button from '../../../atoms/button/Button';
import Text from '../../../atoms/text/Text';

import ProcessWrapper from './ProcessWrapper';

function Terms({ url, onSubmit }) {
  return (
    <ProcessWrapper>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div style={{ margin: 'var(--sp-normal)', maxWidth: '450px' }}>
          <Text variant="h2" weight="medium">
            Agree with terms
          </Text>
          <div style={{ marginBottom: 'var(--sp-normal)' }} />
          <Text variant="b1">
            In order to complete registration, you need to agree to the terms and conditions.
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--sp-normal) 0' }}>
            <input style={{ marginRight: '8px' }} id="termsCheckbox" type="checkbox" required />
            <Text variant="b1">
              {'I accept '}
              <a style={{ cursor: 'pointer' }} href={url} rel="noreferrer" target="_blank">
                Terms and Conditions
              </a>
            </Text>
          </div>
          <Button id="termsBtn" type="submit" variant="primary">
            Submit
          </Button>
        </div>
      </form>
    </ProcessWrapper>
  );
}
Terms.propTypes = {
  url: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Terms;
