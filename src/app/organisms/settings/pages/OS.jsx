import React, { useState, useEffect } from 'react';

import Toggle from '../../../atoms/button/Toggle';
import SettingTile from '../../../molecules/setting-tile/SettingTile';
import { getOsSettings, toggleOsSettingsAction } from '../../../../util/libs/osSettings';
import { ENVapp } from '../../../../util/tools';

function OsSection() {

    const osSettings = getOsSettings();

    const [startMinimized, setStartMinimized] = useState(osSettings.startMinimized);
    const [autoLaunchEnabled, setAutoLaunchEnabled] = useState(false);

    if (ENVapp.electron_mode) {
        autoLaunch.start(ENVapp.info.name);
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
                        content={<div className="very-small text-gray">Save yourself a few clicks and let {ENVapp.info.name} greet you on computer startup.</div>}
                    />

                    <SettingTile
                        title="Startup minimize to tray"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={startMinimized}
                                onToggle={toggleOsSettingsAction('startMinimized', setStartMinimized)}
                            />
                        )}
                        content={<div className="very-small text-gray">When the application starts, it will automatically minimize.</div>}
                    />

                </ul>
            </div>
        </div>
    );
};

export default OsSection;