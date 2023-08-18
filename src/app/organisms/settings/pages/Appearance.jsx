import React, { useState, useEffect } from 'react';

import initMatrix from '../../../../client/initMatrix';

import settings from '../../../../client/state/settings';
import Toggle from '../../../atoms/button/Toggle';
import SegmentedControls from '../../../atoms/segmented-controls/SegmentedControls';
import SettingTile from '../../../molecules/setting-tile/SettingTile';

import { toggleAction } from '../Api';

import {
    toggleSystemTheme, toggleMarkdown, toggleMembershipEvents, toggleNickAvatarEvents,
} from '../../../../client/action/settings';

function AppearanceSection() {
    const [, updateState] = useState({});
    const [isAnimateAvatarsHidden, setAnimateAvatarsHidden] = useState(false);
    const [isEmbedDisabled, setEmbedDisabled] = useState(false);
    const [isUNhoverDisabled, setUNhoverDisabled] = useState(false);

    useEffect(() => {

        const content = initMatrix.matrixClient.getAccountData('pony.house.appearance')?.getContent() ?? {};
        setAnimateAvatarsHidden((content.isAnimateAvatarsHidden === true));
        setEmbedDisabled((content.isEmbedDisabled === true));
        setUNhoverDisabled((content.isUNhoverDisabled === true));

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
                        title="Theme"
                        content={(
                            <div className='mt-2'>
                                <SegmentedControls
                                    selected={settings.useSystemTheme ? -1 : settings.getThemeIndex()}
                                    segments={[
                                        { text: 'Light' },
                                        { text: 'Silver' },
                                        { text: 'Dark' },
                                        { text: 'Butter' },
                                        { text: 'Black (Beta)' },
                                    ]}
                                    onSelect={(index) => {
                                        if (settings.useSystemTheme) toggleSystemTheme();
                                        settings.setTheme(index);
                                        updateState({});
                                    }}
                                />
                            </div>
                        )}
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
                    <li className="list-group-item very-small text-gray">{__ENV_APP__.info.name}</li>

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
                        title="Disable message url embed"
                        options={(
                            <Toggle
                                className='d-inline-flex'
                                isActive={isEmbedDisabled}
                                onToggle={toggleAction('pony.house.appearance', 'isEmbedDisabled', setEmbedDisabled)}
                            />
                        )}
                        content={<div className="very-small text-gray">All messages will no longer load embed.</div>}
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

        </div>
    );
}

export default AppearanceSection;