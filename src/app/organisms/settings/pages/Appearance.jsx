import React, { useState, useEffect, useRef } from 'react';

import initMatrix from '../../../../client/initMatrix';

import settings from '../../../../client/state/settings';
import Toggle from '../../../atoms/button/Toggle';
import SegmentedControls from '../../../atoms/segmented-controls/SegmentedControls';
import SettingTile from '../../../molecules/setting-tile/SettingTile';

import { toggleAction } from '../Api';

import {
    toggleSystemTheme, toggleMarkdown, toggleMembershipEvents, toggleNickAvatarEvents,
} from '../../../../client/action/settings';
import { tinyAppZoomValidator } from '../../../../util/tools';

function AppearanceSection() {

    const [, updateState] = useState({});

    const [showUserDMstatus, setShowUserStatus] = useState(true);
    const [pinDMmessages, setPinDMmessages] = useState(true);
    const [isAnimateAvatarsHidden, setAnimateAvatarsHidden] = useState(false);
    const [isEmbedDisabled, setEmbedDisabled] = useState(false);
    const [isUNhoverDisabled, setUNhoverDisabled] = useState(false);

    const ponyHouseZoomRef = useRef(null);
    const ponyHouseZoomRangeRef = useRef(null);

    useEffect(() => {

        const content = initMatrix.matrixClient.getAccountData('pony.house.appearance')?.getContent() ?? {};
        const zoomApp = Number(global.localStorage.getItem('pony-house-zoom'));

        setPinDMmessages((content.pinDMmessages !== false));
        setShowUserStatus((content.showUserDMstatus !== false));
        setAnimateAvatarsHidden((content.isAnimateAvatarsHidden === true));
        setEmbedDisabled((content.isEmbedDisabled === true));
        setUNhoverDisabled((content.isUNhoverDisabled === true));

        const ponyHouseZoom = $(ponyHouseZoomRef.current);
        const ponyHouseZoomRange = $(ponyHouseZoomRangeRef.current);

        ponyHouseZoom.val(tinyAppZoomValidator(zoomApp));
        ponyHouseZoomRange.val(tinyAppZoomValidator(zoomApp));

        ponyHouseZoomRange.on('change keyup keydown keypress input', () => {

            const newValue = Number(ponyHouseZoomRange.val());
            const value = tinyAppZoomValidator(newValue);
            ponyHouseZoom.val(value);

        });

        ponyHouseZoom.on('change keyup keydown keypress', () => {

            const newValue = Number(ponyHouseZoom.val());
            const value = tinyAppZoomValidator(newValue);
            if (newValue !== value) ponyHouseZoom.val(value);
            ponyHouseZoomRange.val(value);

        });

    }, []);

    return (
        <div>

            <div className="card noselect mb-3">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item very-small text-gray">Theme</li>

                    <SettingTile
                        title="Follow system theme"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={settings.useSystemTheme}
                                onToggle={() => { toggleSystemTheme(); updateState({}); }}
                            />
                        )}
                        content={<div className="very-small text-gray">Use light or dark mode based on the system settings.</div>}
                    />

                    <SettingTile
                        title='Theme'
                        content={(
                            <div className='mt-2'>
                                <SegmentedControls
                                    type='select'
                                    selected={settings.useSystemTheme ? -1 : settings.getThemeIndex()}
                                    segments={settings.themesName}
                                    onSelect={(index) => {
                                        if (settings.useSystemTheme) toggleSystemTheme();
                                        settings.setTheme(index);
                                        updateState({});
                                    }}
                                />
                            </div>
                        )}
                    />

                    <li className="list-group-item">

                        <label for='pony_house_zoom' className="form-label small">Zoom</label>

                        <input ref={ponyHouseZoomRef} type="number" max={200} min={50} className="form-control form-control-bg" id='pony_house_zoom' />
                        <input ref={ponyHouseZoomRangeRef} max={200} min={50} type="range" className="form-range" />

                        <div className="very-small text-gray">
                            {`Set the application zoom. If the configuration doesn't work, it's because your ${__ENV_APP__.electron_mode ? 'client' : 'browser'} is not compatible. (Beta)`}
                            <button type="button" className="ms-3 btn btn-sm btn-secondary" onClick={async () => {

                                const ponyHouseZoomRange = $(ponyHouseZoomRangeRef.current);
                                const newValue = Number(ponyHouseZoomRange.val());
                                const value = tinyAppZoomValidator(newValue);

                                global.localStorage.setItem('pony-house-zoom', value);
                                $('body').css('zoom', `${value}%`);

                            }}>Change zoom</button>
                        </div>

                    </li>

                </ul>
            </div>

            <div className="card noselect mt-3">
                <ul className="list-group list-group-flush">

                    <li className="list-group-item very-small text-gray">Room users</li>

                    <SettingTile
                        title="Show user DM status"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={showUserDMstatus}
                                onToggle={toggleAction('pony.house.appearance', 'showUserDMstatus', setShowUserStatus)}
                            />
                        )}
                        content={<div className="very-small text-gray">All users in your DM will show whether they are online or not.</div>}
                    />

                    <SettingTile
                        title="Pin DMs on the sidebar"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={pinDMmessages}
                                onToggle={toggleAction('pony.house.appearance', 'pinDMmessages', setPinDMmessages)}
                            />
                        )}
                        content={<div className="very-small text-gray">Whenever you receive a new notification in your DM list, you will see a notification icon in the sidebar.</div>}
                    />

                </ul>
            </div>

            <div className="card noselect mt-3">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item very-small text-gray">Room messages</li>
                    <SettingTile
                        title="Markdown formatting"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={settings.isMarkdown}
                                onToggle={() => { toggleMarkdown(); updateState({}); }}
                            />
                        )}
                        content={<div className="very-small text-gray">Format messages with markdown syntax before sending.</div>}
                    />
                    <SettingTile
                        title="Hide membership events"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={settings.hideMembershipEvents}
                                onToggle={() => { toggleMembershipEvents(); updateState({}); }}
                            />
                        )}
                        content={<div className="very-small text-gray">Hide membership change messages from room timeline. (Join, Leave, Invite, Kick and Ban)</div>}
                    />
                    <SettingTile
                        title="Hide nick/avatar events"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={settings.hideNickAvatarEvents}
                                onToggle={() => { toggleNickAvatarEvents(); updateState({}); }}
                            />
                        )}
                        content={<div className="very-small text-gray">Hide nick and avatar change messages from room timeline.</div>}
                    />
                </ul>
            </div>

            <div className="card noselect mt-3">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item very-small text-gray">User message</li>

                    <SettingTile
                        title="Disable animated hover avatars"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={isAnimateAvatarsHidden}
                                onToggle={toggleAction('pony.house.appearance', 'isAnimateAvatarsHidden', setAnimateAvatarsHidden)}
                            />
                        )}
                        content={<div className="very-small text-gray">Turn off animated avatars that are displayed when you mouse over it.</div>}
                    />

                    <SettingTile
                        title="Disable username hover"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={isUNhoverDisabled}
                                onToggle={toggleAction('pony.house.appearance', 'isUNhoverDisabled', setUNhoverDisabled)}
                            />
                        )}
                        content={<div className="very-small text-gray">When you hover over a user nickname, the username will no longer be displayed. You will need to open the user&apos;s profile to see their identity.</div>}
                    />

                </ul>
            </div>

            <div className="card noselect mt-3">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item very-small text-gray">Embed</li>

                    <SettingTile
                        title="Disable embed to message url"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={isEmbedDisabled}
                                onToggle={toggleAction('pony.house.appearance', 'isEmbedDisabled', setEmbedDisabled)}
                            />
                        )}
                        content={<div className="very-small text-gray">All messages will no longer load embed.</div>}
                    />

                </ul>
            </div>

        </div>
    );
}

export default AppearanceSection;