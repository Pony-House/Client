import React from 'react';
import PropTypes from 'prop-types';

import Text from '../text/Text';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

function Divider({ text, variant }) {
  return (
    <tr>
      <td colSpan="2">
        <center className={`very-small border-bottom border-${variant}`}>
          {text !== null && <div className={`text-bg badge bg-${variant} rounded-0 border-bottom border-${variant}`}>{text}</div>}
        </center>
      </td>
    </tr>
  );
}

Divider.defaultProps = {
  text: null,
  variant: 'link btn-bg',
};

Divider.propTypes = {
  text: PropTypes.string,
  variant: PropTypes.oneOf(bsColorsArray),
};

export default Divider;
