import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { Formik } from 'formik';

import Text from '../../../atoms/text/Text';
import * as auth from '../../../../client/action/auth';
import { getBaseUrl } from '../../../../util/matrixUtil';
import Button from '../../../atoms/button/Button';
import IconButton from '../../../atoms/button/IconButton';
import Input from '../../../atoms/input/Input';
import ContextMenu, { MenuItem } from '../../../atoms/context-menu/ContextMenu';

import SSOButtons from '../../../molecules/sso-buttons/SSOButtons';

import LoadingScreen from './LoadingScreen';

import { EMAIL_REGEX, BAD_EMAIL_ERROR } from './regex';
import { normalizeUsername, isValidInput } from './validator';

function Login({ loginFlow, baseUrl }) {
  const [typeIndex, setTypeIndex] = useState(0);
  const [passVisible, setPassVisible] = useState(false);
  const loginTypes = ['Username', 'Email'];
  const isPassword = loginFlow?.filter((flow) => flow.type === 'm.login.password')[0];
  const ssoProviders = loginFlow?.filter((flow) => flow.type === 'm.login.sso')[0];

  const initialValues = {
    username: '',
    password: '',
    email: '',
    other: '',
  };

  const validator = (values) => {
    const errors = {};
    if (typeIndex === 1 && values.email.length > 0 && !isValidInput(values.email, EMAIL_REGEX)) {
      errors.email = BAD_EMAIL_ERROR;
    }
    return errors;
  };
  const submitter = async (values, actions) => {
    let userBaseUrl = baseUrl;
    let { username } = values;
    const mxIdMatch = username.match(/^@(.+):(.+\..+)$/);
    if (typeIndex === 0 && mxIdMatch) {
      [, username, userBaseUrl] = mxIdMatch;
      userBaseUrl = await getBaseUrl(userBaseUrl);
    }

    return auth
      .login(
        userBaseUrl,
        typeIndex === 0 ? normalizeUsername(username) : undefined,
        typeIndex === 1 ? values.email : undefined,
        values.password,
      )
      .then(() => {
        actions.setSubmitting(true);
        window.location.reload();
      })
      .catch((error) => {
        let msg = error.message;
        if (msg === 'Unknown message') msg = 'Please check your credentials';
        actions.setErrors({
          password: msg === 'Invalid password' ? msg : undefined,
          other: msg !== 'Invalid password' ? msg : undefined,
        });
        actions.setSubmitting(false);
      });
  };

  return (
    <>
      <div className="auth-form__heading">
        <h5>Welcome back</h5>
        {isPassword && (
          <ContextMenu
            placement="right"
            content={(hideMenu) =>
              loginTypes.map((type, index) => (
                <MenuItem
                  key={type}
                  onClick={() => {
                    hideMenu();
                    setTypeIndex(index);
                  }}
                >
                  {type}
                </MenuItem>
              ))
            }
            render={(toggleMenu) => (
              <Button onClick={toggleMenu} faSrc="fa-solid fa-chevron-down">
                {loginTypes[typeIndex]}
              </Button>
            )}
          />
        )}
      </div>
      {isPassword && (
        <Formik initialValues={initialValues} onSubmit={submitter} validate={validator}>
          {({ values, errors, handleChange, handleSubmit, isSubmitting }) => (
            <>
              {isSubmitting && <LoadingScreen message="Login in progress..." />}
              <form className="auth-form" onSubmit={handleSubmit}>
                {typeIndex === 0 && (
                  <div>
                    <Input
                      values={values.username}
                      name="username"
                      onChange={handleChange}
                      label="Username"
                      type="username"
                      required
                    />
                  </div>
                )}
                {errors.username && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.username}
                  </Text>
                )}
                {typeIndex === 1 && (
                  <div>
                    <Input
                      values={values.email}
                      name="email"
                      onChange={handleChange}
                      label="Email"
                      type="email"
                      required
                    />
                  </div>
                )}
                {errors.email && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.email}
                  </Text>
                )}

                <div className="auth-form__pass-eye-wrapper">
                  <div>
                    <Input
                      values={values.password}
                      name="password"
                      onChange={handleChange}
                      label="Password"
                      type={passVisible ? 'text' : 'password'}
                      required
                    />
                  </div>
                  <IconButton
                    onClick={() => setPassVisible(!passVisible)}
                    fa={passVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'}
                    size="extra-small"
                  />
                </div>

                {errors.password && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.password}
                  </Text>
                )}
                {errors.other && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.other}
                  </Text>
                )}
                <div className="auth-form__btns">
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    Login
                  </Button>
                </div>
              </form>
            </>
          )}
        </Formik>
      )}
      {ssoProviders && isPassword && <Text className="sso__divider">OR</Text>}
      {ssoProviders && (
        <SSOButtons
          type="sso"
          identityProviders={ssoProviders.identity_providers}
          baseUrl={baseUrl}
        />
      )}
    </>
  );
}
Login.propTypes = {
  loginFlow: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  baseUrl: PropTypes.string.isRequired,
};

export default Login;

/*

        <div className="form-outline mb-4 small">
            <input type="email" id="tinyemail" className="form-control form-control-bg form-control-lg" />
            <label className="form-label text-bg-low" for="tinyemail">Email address</label>
        </div>

        <div className="form-outline mb-4 small">
            <input type="password" id="tinypassword" className="form-control form-control-bg form-control-lg" />
            <label className="form-label text-bg-low" for="tinypassword">Password</label>
        </div>

        <div className="pt-1 mb-4 small">
            <button className="btn btn-dark btn-block" type="button" >

            </button>
        </div>

*/
