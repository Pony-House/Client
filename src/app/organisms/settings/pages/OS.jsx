import React, { useState, useEffect } from 'react';

import Toggle from '../../../atoms/button/Toggle';
import SettingTile from '../../../molecules/setting-tile/SettingTile';

function OsSection() {
    const [autoLaunchEnabled, setAutoLaunchEnabled] = useState(false);

    if (__ENV_APP__.electron_mode) {
        autoLaunch.start(__ENV_APP__.info.name);
    }

    useEffect(() => {
        autoLaunch.isEnabled().then(isEnabled => setAutoLaunchEnabled(isEnabled === true));
    }, []);

    return (
        <div>
            <div className="card noselect mt-3">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item very-small text-gray">Main</li>
                    <SettingTile
                        title='Auto Launch'
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={autoLaunchEnabled}
                                onToggle={(isEnabled) => {
                                    if (typeof isEnabled === 'boolean') {

                                        if (isEnabled) {
                                            autoLaunch.enable();
                                        } else {
                                            autoLaunch.disable();
                                        }

                                        setAutoLaunchEnabled(isEnabled);

                                    }
                                }}
                            />
                        )}
                        content={<div className="very-small text-gray">Launch application along with the operating system.</div>}
                    />
                </ul>
            </div>
        </div>
    );
};

export default OsSection;