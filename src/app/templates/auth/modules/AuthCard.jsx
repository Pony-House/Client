import React, { useState } from 'react';

import Homeserver from './Homeserver';
import Login from './Login';
import Register from './Register';
import ResetPassword from './ResetPassword';

global.authPublicData = {};
function AuthCard() {
  const [hsConfig, setHsConfig] = useState(null);
  const [type, setType] = useState('login');

  const handleHsChange = (info) => {
    setHsConfig(info);
  };

  global.authPublicData.register = { params: hsConfig?.register?.params };

  return (
    <>
      <div className="mb-4">
        <Homeserver
          className={type === 'reset-password' ? 'd-none' : null}
          onChange={handleHsChange}
        />
      </div>

      {hsConfig !== null &&
        (type === 'login' ? (
          <Login loginFlow={hsConfig.login.flows} baseUrl={hsConfig.baseUrl} />
        ) : type === 'register' ? (
          <Register
            registerInfo={hsConfig.register}
            loginFlow={hsConfig.login.flows}
            baseUrl={hsConfig.baseUrl}
          />
        ) : (
          <ResetPassword serverName={hsConfig.serverName} baseUrl={hsConfig.baseUrl} />
        ))}

      {hsConfig !== null && (
        <center>
          {type === 'login' && (
            <a
              className="very-small"
              onClick={() => setType(type === 'reset-password' ? 'login' : 'reset-password')}
              href="#!"
            >
              Forgot password?
            </a>
          )}
          <p className="mb-4 pb-lg-2 small">
            {`${type === 'login' ? "Don't have" : 'Already have'} an account?`}{' '}
            <a href="#!" onClick={() => setType(type === 'login' ? 'register' : 'login')}>
              {type === 'login' ? 'Register here' : 'Login here'}
            </a>
          </p>
        </center>
      )}
    </>
  );
}

export default AuthCard;
