import React, { useState } from 'react';

import Homeserver from './Homeserver';
import Login from './Login';
import Register from './Register';

function AuthCard() {
    const [hsConfig, setHsConfig] = useState(null);
    const [type, setType] = useState('login');

    const handleHsChange = (info) => {
        console.log(info);
        setHsConfig(info);
    };

    return (<>

        <div className='mb-4'>
            <Homeserver onChange={handleHsChange} />
        </div>

        {hsConfig !== null && (
            type === 'login'
                ? <Login loginFlow={hsConfig.login.flows} baseUrl={hsConfig.baseUrl} />
                : (
                    <Register
                        registerInfo={hsConfig.register}
                        loginFlow={hsConfig.login.flows}
                        baseUrl={hsConfig.baseUrl}
                    />
                )
        )}

        {hsConfig !== null && (<>

            { /* (type === 'login' && <a className="very-small" href="#!">Forgot password?</a>) */}

            <center>
                <p className="mb-4 pb-lg-2 small" >{`${(type === 'login' ? 'Don\'t have' : 'Already have')} an account?`} <a href="#!" onClick={() => setType((type === 'login') ? 'register' : 'login')}>
                    {type === 'login' ? 'Register here' : 'Login here'}
                </a></p>
            </center>

        </>)}

    </>);
}

export default AuthCard;