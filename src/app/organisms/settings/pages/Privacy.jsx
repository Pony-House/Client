import React, { useState, useEffect } from 'react';

import initMatrix from '../../../../client/initMatrix';
import Toggle from '../../../atoms/button/Toggle';
import SettingTile from '../../../molecules/setting-tile/SettingTile';

import { toggleAction } from '../Api';

function PrivacySection() {
    const [hideTypingWarn, sethideTypingWarn] = useState(false);

    useEffect(() => {

        const content = initMatrix.matrixClient.getAccountData('pony.house.privacy')?.getContent() ?? {};
        sethideTypingWarn((content.hideTypingWarn === true));

    }, []);

    return (
        <div>
            <div className="card noselect mt-3">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item very-small text-gray">Chat room</li>
                    <SettingTile
                        title={"Disable \"typing\" warning"}
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={hideTypingWarn}
                                onToggle={toggleAction('pony.house.privacy', 'hideTypingWarn', sethideTypingWarn)}
                            />
                        )}
                        content={<div className="very-small text-gray">Users will no longer be able to see whether or not you are typing.</div>}
                    />
                </ul>
            </div>
        </div>
    );
};

export default PrivacySection;