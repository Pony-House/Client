import React from 'react';
import PropTypes from 'prop-types';

import Img from '@src/app/atoms/image/Image';
import Tooltip from '@src/app/atoms/tooltip/Tooltip';
import MxcUrl from '@src/util/libs/MxcUrl';

import { createTemporaryClient, startSsoLogin } from '../../../client/action/auth';

import Button from '../../atoms/button/Button';

function SSOButtons({ type, identityProviders, baseUrl }) {
  const tempClient = createTemporaryClient(baseUrl);
  const mxcUrl = new MxcUrl(tempClient);
  function handleClick(id) {
    startSsoLogin(baseUrl, type, id);
  }
  return (
    <div className="sso-buttons">
      {identityProviders
        .sort((idp, idp2) => {
          if (typeof idp.icon !== 'string') return -1;
          return idp.name.toLowerCase() > idp2.name.toLowerCase() ? 1 : -1;
        })
        .map((idp) =>
          idp.icon ? (
            <Tooltip placement="top" content={<div className="small">{idp.name}</div>}>
              <button
                key={idp.id}
                type="button"
                className="sso-btn"
                onClick={() => handleClick(idp.id)}
              >
                <Img
                  className="sso-btn__img rounded-circle"
                  src={mxcUrl.toHttp(idp.icon)}
                  alt={idp.name}
                />
              </button>
            </Tooltip>
          ) : (
            <Button
              key={idp.id}
              className="sso-btn__text-only"
              onClick={() => handleClick(idp.id)}
            >{`Login with ${idp.name}`}</Button>
          ),
        )}
    </div>
  );
}

SSOButtons.propTypes = {
  identityProviders: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  baseUrl: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['sso', 'cas']).isRequired,
};

export default SSOButtons;
