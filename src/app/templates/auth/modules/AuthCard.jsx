import React, { useEffect, useState } from 'react';
import { objType } from 'for-promise/utils/lib.mjs';

import hsWellKnown from '@src/util/libs/HsWellKnown';
import Homeserver from './Homeserver';
import Login from './Login';
import Register from './Register';
import ResetPassword from './ResetPassword';

if (__ENV_APP__.MODE === 'development') global.authPublicData = {};
function AuthCard() {
  const [hsConfig, setHsConfig] = useState(null);
  const [type, setType] = useState('login');

  useEffect(() => {
    const handleHsChange = (info) => setHsConfig(info);
    hsWellKnown.on('changeData', handleHsChange);
    return () => {
      hsWellKnown.off('changeData', handleHsChange);
    };
  });

  if (__ENV_APP__.MODE === 'development')
    global.authPublicData.register = { params: hsConfig?.register?.params };
  return (
    <>
      <div className="mb-4">
        <Homeserver className={type === 'reset-password' ? 'd-none' : null} />
      </div>

      {objType(hsConfig, 'object') &&
        hsConfig.baseUrl &&
        (type === 'login' ? (
          objType(hsConfig.login, 'object') && Array.isArray(hsConfig.login.flows) ? (
            <Login />
          ) : (
            <center className="small text-danger">No login flows!</center>
          )
        ) : type === 'register' ? (
          objType(hsConfig.login, 'object') && objType(hsConfig.register, 'object') ? (
            <Register />
          ) : (
            <center className="small text-danger">No register flows!</center>
          )
        ) : hsConfig.baseUrl && hsConfig.serverName ? (
          <ResetPassword />
        ) : null)}

      {objType(hsConfig, 'object') && hsWellKnown.getBaseUrl() && (
        <center>
          {type === 'login' && (
            <a
              className="very-small"
              onClick={(e) => {
                setType(type === 'reset-password' ? 'login' : 'reset-password');
                e.preventDefault();
              }}
              href="#!"
            >
              Forgot password?
            </a>
          )}
          <p className="mb-4 pb-lg-2 small">
            {`${type === 'login' ? "Don't have" : 'Already have'} an account?`}{' '}
            <a
              href="#!"
              onClick={(e) => {
                setType(type === 'login' ? 'register' : 'login');
                e.preventDefault();
              }}
            >
              {type === 'login' ? 'Register here' : 'Login here'}
            </a>
          </p>
        </center>
      )}
    </>
  );
}

export default AuthCard;
