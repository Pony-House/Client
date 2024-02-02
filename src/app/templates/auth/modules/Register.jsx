import React, { useState, useEffect, useRef } from 'react';

import PropTypes from 'prop-types';
import { Formik } from 'formik';

import * as auth from '../../../../client/action/auth';
import Button from '../../../atoms/button/Button';
import IconButton from '../../../atoms/button/IconButton';
import Input from '../../../atoms/input/Input';
import Text from '../../../atoms/text/Text';

import SSOButtons from '../../../molecules/sso-buttons/SSOButtons';

import LoadingScreen from './LoadingScreen';
import Recaptcha from './Recaptcha';
import Terms from './Terms';
import EmailVerify from './EmailVerify';

import { EMAIL_REGEX, BAD_EMAIL_ERROR } from './regex';
import { isValidInput } from './validator';

const LOCALPART_SIGNUP_REGEX = /^[a-z0-9_\-.=/]+$/;
const BAD_LOCALPART_ERROR = "Username can only contain characters a-z, 0-9, or '=_-./'";
const USER_ID_TOO_LONG_ERROR =
  "Your user ID, including the hostname, can't be more than 255 characters long.";

const PASSWORD_STRENGHT_REGEX = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,127}$/;
const BAD_PASSWORD_ERROR =
  'Password must contain at least 1 lowercase, 1 uppercase, 1 number, 1 non-alphanumeric character, 8-127 characters with no space.';
const CONFIRM_PASSWORD_ERROR = "Passwords don't match.";

let sid;
let clientSecret;
function Register({ registerInfo, loginFlow, baseUrl }) {
  const [process, setProcess] = useState({});
  const [passVisible, setPassVisible] = useState(false);
  const [cPassVisible, setCPassVisible] = useState(false);
  const formRef = useRef();

  const ssoProviders = loginFlow?.filter((flow) => flow.type === 'm.login.sso')[0];
  const isDisabled = registerInfo.errcode !== undefined;
  const { flows, params, session } = registerInfo;

  let isEmail = false;
  let isEmailRequired = true;
  let isRecaptcha = false;
  let isTerms = false;
  let isDummy = false;

  flows?.forEach((flow) => {
    if (isEmailRequired && flow.stages.indexOf('m.login.email.identity') === -1)
      isEmailRequired = false;
    if (!isEmail) isEmail = flow.stages.indexOf('m.login.email.identity') > -1;
    if (!isRecaptcha) isRecaptcha = flow.stages.indexOf('m.login.recaptcha') > -1;
    if (!isTerms) isTerms = flow.stages.indexOf('m.login.terms') > -1;
    if (!isDummy) isDummy = flow.stages.indexOf('m.login.dummy') > -1;
  });

  const initialValues = {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    other: '',
  };

  const validator = (values) => {
    const errors = {};
    if (values.username.list > 255) errors.username = USER_ID_TOO_LONG_ERROR;
    if (values.username.length > 0 && !isValidInput(values.username, LOCALPART_SIGNUP_REGEX)) {
      errors.username = BAD_LOCALPART_ERROR;
    }
    if (values.password.length > 0 && !isValidInput(values.password, PASSWORD_STRENGHT_REGEX)) {
      errors.password = BAD_PASSWORD_ERROR;
    }
    if (
      values.confirmPassword.length > 0 &&
      !isValidInput(values.confirmPassword, values.password)
    ) {
      errors.confirmPassword = CONFIRM_PASSWORD_ERROR;
    }
    if (values.email.length > 0 && !isValidInput(values.email, EMAIL_REGEX)) {
      errors.email = BAD_EMAIL_ERROR;
    }
    return errors;
  };
  const submitter = (values, actions) => {
    const tempClient = auth.createTemporaryClient(baseUrl);
    clientSecret = tempClient.generateClientSecret();
    return tempClient
      .isUsernameAvailable(values.username)
      .then(async (isAvail) => {
        if (!isAvail) {
          actions.setErrors({ username: 'Username is already taken' });
          actions.setSubmitting(false);
          return;
        }
        if (isEmail && values.email.length > 0) {
          const result = await auth.verifyEmail(baseUrl, values.email, clientSecret, 1);
          if (result.errcode) {
            if (result.errcode === 'M_THREEPID_IN_USE') actions.setErrors({ email: result.error });
            else actions.setErrors({ others: result.error || result.message });
            actions.setSubmitting(false);
            return;
          }
          sid = result.sid;
        }
        setProcess({ type: 'processing', message: 'Registration in progress....' });
        actions.setSubmitting(false);
      })
      .catch((err) => {
        const msg = err.message || err.error;
        if (['M_USER_IN_USE', 'M_INVALID_USERNAME', 'M_EXCLUSIVE'].indexOf(err.errcode) > -1) {
          actions.setErrors({
            username: err.errcode === 'M_USER_IN_USE' ? 'Username is already taken' : msg,
          });
        } else if (msg) actions.setErrors({ other: msg });

        actions.setSubmitting(false);
      });
  };

  const refreshWindow = () => window.location.reload();

  const getInputs = () => {
    const f = formRef.current;
    return [f.username.value, f.password.value, f?.email?.value];
  };

  useEffect(() => {
    if (process.type !== 'processing') return;
    const asyncProcess = async () => {
      const [username, password, email] = getInputs();
      const d = await auth.completeRegisterStage(baseUrl, username, password, { session });

      if (isRecaptcha && !d.completed.includes('m.login.recaptcha')) {
        const sitekey = params['m.login.recaptcha'].public_key;
        setProcess({ type: 'm.login.recaptcha', sitekey });
        return;
      }
      if (isTerms && !d.completed.includes('m.login.terms')) {
        const pp = params['m.login.terms'].policies.privacy_policy;
        const url = pp?.en.url || pp[Object.keys(pp)[0]].url;
        setProcess({ type: 'm.login.terms', url });
        return;
      }
      if (isEmail && email.length > 0) {
        setProcess({ type: 'm.login.email.identity', email });
        return;
      }
      if (isDummy) {
        const data = await auth.completeRegisterStage(baseUrl, username, password, {
          type: 'm.login.dummy',
          session,
        });
        if (data.done) refreshWindow();
      }
    };
    asyncProcess();
  }, [process]);

  const handleRecaptcha = async (value) => {
    if (typeof value !== 'string') return;
    const [username, password] = getInputs();
    const d = await auth.completeRegisterStage(baseUrl, username, password, {
      type: 'm.login.recaptcha',
      response: value,
      session,
    });
    if (d.done) refreshWindow();
    else setProcess({ type: 'processing', message: 'Registration in progress...' });
  };
  const handleTerms = async () => {
    const [username, password] = getInputs();
    const d = await auth.completeRegisterStage(baseUrl, username, password, {
      type: 'm.login.terms',
      session,
    });
    if (d.done) refreshWindow();
    else setProcess({ type: 'processing', message: 'Registration in progress...' });
  };
  const handleEmailVerify = async () => {
    const [username, password] = getInputs();
    const d = await auth.completeRegisterStage(baseUrl, username, password, {
      type: 'm.login.email.identity',
      threepidCreds: { sid, client_secret: clientSecret },
      threepid_creds: { sid, client_secret: clientSecret },
      session,
    });
    if (d.done) refreshWindow();
    else setProcess({ type: 'processing', message: 'Registration in progress...' });
  };

  return (
    <>
      {process.type === 'processing' && <LoadingScreen message={process.message} />}
      {process.type === 'm.login.recaptcha' && (
        <Recaptcha
          message="Please check the box below to proceed."
          sitekey={process.sitekey}
          onChange={handleRecaptcha}
        />
      )}
      {process.type === 'm.login.terms' && <Terms url={process.url} onSubmit={handleTerms} />}
      {process.type === 'm.login.email.identity' && (
        <EmailVerify email={process.email} onContinue={handleEmailVerify} />
      )}

      <div className="auth-form__heading">
        {!isDisabled && <h5>New user</h5>}
        {isDisabled && <Text className="auth-form__error">{registerInfo.error}</Text>}
      </div>

      {!isDisabled && (
        <Formik initialValues={initialValues} onSubmit={submitter} validate={validator}>
          {({ values, errors, handleChange, handleSubmit, isSubmitting }) => (
            <>
              {process.type === undefined && isSubmitting && (
                <LoadingScreen message="Registration in progress..." />
              )}
              <form className="auth-form" ref={formRef} onSubmit={handleSubmit}>
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

                {errors.username && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.username}
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
                    src={passVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'}
                    size="extra-small"
                  />
                </div>

                {errors.password && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.password}
                  </Text>
                )}

                <div className="auth-form__pass-eye-wrapper">
                  <div>
                    <Input
                      values={values.confirmPassword}
                      name="confirmPassword"
                      onChange={handleChange}
                      label="Confirm password"
                      type={cPassVisible ? 'text' : 'password'}
                      required
                    />
                  </div>
                  <IconButton
                    onClick={() => setCPassVisible(!cPassVisible)}
                    src={cPassVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'}
                    size="extra-small"
                  />
                </div>

                {errors.confirmPassword && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.confirmPassword}
                  </Text>
                )}
                {isEmail && (
                  <div>
                    <Input
                      values={values.email}
                      name="email"
                      onChange={handleChange}
                      label={`Email${isEmailRequired ? '' : ' (optional)'}`}
                      type="email"
                      required={isEmailRequired}
                    />
                  </div>
                )}

                {errors.email && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.email}
                  </Text>
                )}
                {errors.other && (
                  <Text className="auth-form__error" variant="b3">
                    {errors.other}
                  </Text>
                )}

                <div className="auth-form__btns">
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    Register
                  </Button>
                </div>
              </form>
            </>
          )}
        </Formik>
      )}

      {isDisabled && ssoProviders && (
        <SSOButtons
          type="sso"
          identityProviders={ssoProviders.identity_providers}
          baseUrl={baseUrl}
        />
      )}
    </>
  );
}
Register.propTypes = {
  registerInfo: PropTypes.shape({}).isRequired,
  loginFlow: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  baseUrl: PropTypes.string.isRequired,
};

export default Register;
