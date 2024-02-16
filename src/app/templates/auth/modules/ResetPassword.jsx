import React, { useState, useRef } from 'react';

import { Formik } from 'formik';
import PropTypes from 'prop-types';
import * as auth from '../../../../client/action/auth';
import { EMAIL_REGEX, BAD_EMAIL_ERROR, CONFIRM_PASSWORD_ERROR, BAD_PASSWORD_ERROR, PASSWORD_STRENGHT_REGEX } from './regex';
import { isValidInput } from './validator';
import Input from '../../../atoms/input/Input';
import Text from '../../../atoms/text/Text';
import Button from '../../../atoms/button/Button';
import IconButton from '../../../atoms/button/IconButton';

import LoadingScreen from './LoadingScreen';

let tempClient;
let clientSecret;
function ResetPassword({ baseUrl, registerInfo }) {

    const [process] = useState({});
    const [step, setStep] = useState('send');
    const [submitData, setSubmitData] = useState(null);
    const [passVisible, setPassVisible] = useState(false);
    const [cPassVisible, setCPassVisible] = useState(false);
    const { session } = registerInfo;
    const formRef = useRef(null);

    const refreshWindow = () => window.location.reload();
    const initialValues = {
        password: '',
        confirmPassword: '',
        email: '',
    };

    const changePassword = (values, actions) => {

        tempClient.setPassword({
            type: 'm.login.email.identity',
            threepidCreds: { sid: submitData.sid, client_secret: clientSecret },
            threepid_creds: { sid: submitData.sid, client_secret: clientSecret },
            session,
        }, values.password, false).then(() => refreshWindow()).catch((error) => {
            actions.setErrors({
                other: error.message,
            });
            actions.setSubmitting(false);
        });

    };

    const validator = (values) => {
        const errors = {};
        if (values.email.length > 0 && !isValidInput(values.email, EMAIL_REGEX)) {
            errors.email = BAD_EMAIL_ERROR;
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
        return errors;
    };

    const submitEmail = (values, actions) => {

        tempClient = auth.createTemporaryClient(baseUrl);
        clientSecret = tempClient.generateClientSecret();

        tempClient.requestPasswordEmailToken(values.email, clientSecret, 1).then((data) => {
            actions.setSubmitting(true);
            setStep('waiting');
            setSubmitData(data);
        })
            .catch((error) => {
                actions.setErrors({
                    other: error.message,
                });
                actions.setSubmitting(false);
            });

    };

    // const submitNumber = (phoneCountry, phoneNumber) => {

    // tempClient = auth.createTemporaryClient(baseUrl);
    // clientSecret = tempClient.generateClientSecret();

    // tempClient.requestPasswordMsisdnToken(phoneCountry, phoneNumber, clientSecret, 1);

    // };

    return (
        <>

            {step === 'send' ? <>

                {process.type === 'processing' && <LoadingScreen message={process.message} />}

                <Formik initialValues={initialValues} onSubmit={submitEmail} validate={validator}>
                    {({ values, errors, handleChange, handleSubmit, isSubmitting }) => (
                        <>
                            {process.type === undefined && isSubmitting && (
                                <LoadingScreen message="Sending new password request..." />
                            )}
                            <form className="auth-form" ref={formRef} onSubmit={handleSubmit}>

                                <div>
                                    <Input
                                        values={values.email}
                                        name="email"
                                        onChange={handleChange}
                                        label='Email'
                                        type="email"
                                        required
                                    />
                                </div>

                                {errors.email && (
                                    <Text className="auth-form__error" variant="b3">
                                        {errors.email}i
                                    </Text>
                                )}

                                <div className="auth-form__btns">
                                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                                        Send recover email
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </Formik>

            </> : null}

            {step === 'waiting' ? <center>
                <p className='small'>{'Now please follow the instructions that were sent to you to continue your password reset. When you\'re ready, click the button below.'}</p>
                <Button onClick={() => setStep('set_password')} variant="primary" type="submit" className='mb-3'>
                    Next
                </Button>
            </center> : null
            }

            {step === 'set_password' ? <>

                {process.type === 'processing' && <LoadingScreen message={process.message} />}

                <Formik initialValues={initialValues} onSubmit={changePassword} validate={validator}>
                    {({ values, errors, handleChange, handleSubmit, isSubmitting }) => (
                        <>
                            {process.type === undefined && isSubmitting && (
                                <LoadingScreen message="Sending new password..." />
                            )}
                            <form className="auth-form" ref={formRef} onSubmit={handleSubmit}>

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
                                {errors.other && (
                                    <Text className="auth-form__error" variant="b3">
                                        {errors.other}
                                    </Text>
                                )}

                                <div className="auth-form__btns">
                                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                                        Change password
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </Formik>

            </> : null}

        </>
    );

}
ResetPassword.propTypes = {
    baseUrl: PropTypes.string.isRequired,
};

export default ResetPassword;
