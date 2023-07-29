import React from 'react';
import PropTypes from 'prop-types';

import RawIcon from '../system-icons/RawIcon';
import IconButton from '../button/IconButton';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

function InfoCard({
  className, style,
  variant, iconSrc, faSrc,
  title, content,
  rounded, requestClose,
}) {
  const classes = [`info-card info-card--${variant}`];
  if (rounded) classes.push('info-card--rounded');
  if (className) classes.push(className);
  return (
    <div className={classes.join(' ')} style={style}>

      {iconSrc && (
        <div className="info-card__icon">
          <RawIcon color={`var(--ic-${variant}-high)`} src={iconSrc} />
        </div>
      )}

      {faSrc && (
        <div className="info-card__icon">
          <RawIcon fa={faSrc} />
        </div>
      )}

      <div className="info-card__content">
        <small>{title}</small>
        {content}
      </div>

      {requestClose && (
        <IconButton fa="fa-solid fa-xmark" variant={variant} onClick={requestClose} />
      )}

    </div>
  );
}

InfoCard.defaultProps = {
  className: null,
  style: null,
  variant: 'link btn-bg',
  faSrc: null,
  iconSrc: null,
  content: null,
  rounded: false,
  requestClose: null,
};

InfoCard.propTypes = {
  className: PropTypes.string,
  style: PropTypes.shape({}),
  variant: PropTypes.oneOf(bsColorsArray),
  faSrc: PropTypes.string,
  iconSrc: PropTypes.string,
  title: PropTypes.string.isRequired,
  content: PropTypes.node,
  rounded: PropTypes.bool,
  requestClose: PropTypes.func,
};

export default InfoCard;
