import React, { useState } from 'react';

import Text from '../../atoms/text/Text';

function AuthCard() {
    const [hsConfig, setHsConfig] = useState(null);
    const [type, setType] = useState('login');

    const handleHsChange = (info) => {
        console.log(info);
        setHsConfig(info);
    };

    return (
        <>
            <Homeserver onChange={handleHsChange} />
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
            {hsConfig !== null && (
                <Text variant="b2" className="auth-card__switch flex--center">
                    {`${(type === 'login' ? 'Don\'t have' : 'Already have')} an account?`}
                    <button
                        type="button"
                        style={{ color: 'var(--tc-link)', cursor: 'pointer', margin: '0 var(--sp-ultra-tight)' }}
                        onClick={() => setType((type === 'login') ? 'register' : 'login')}
                    >
                        {type === 'login' ? ' Register' : ' Login'}
                    </button>
                </Text>
            )}
        </>
    );
}

export default AuthCard;