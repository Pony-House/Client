import React from 'react';

function OsSection() {

    if (__ENV_APP__.electron_mode) {
        autoLaunch.start(__ENV_APP__.info.name);
    }

    return <div id='test' />;

};

export default OsSection;