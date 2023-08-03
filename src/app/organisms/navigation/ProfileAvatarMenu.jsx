import React, { useState, useEffect, useRef } from 'react';

import clone from 'clone';
import jReact from '../../../../mods/lib/jReact';

import IconButton from '../../atoms/button/IconButton';
import { twemojifyReact } from '../../../util/twemojify';
import navigation from '../../../client/state/navigation';
import Avatar from '../../atoms/avatar/Avatar';
import cons from '../../../client/state/cons';

import { colorMXID } from '../../../util/colorMXID';

import initMatrix from '../../../client/initMatrix';
import { tabText as settingTabText } from '../settings/Settings';
import { getPresence, getUserStatus } from '../../../util/onlineStatus';

import {
    openSettings,
} from '../../../client/action/navigation';
import tinyAPI from '../../../util/mods';

const accountStatus = { status: null, data: null };
export function getAccountStatus(where) {

    if (typeof where === 'string') {

        if (where !== 'status') {
            return clone(accountStatus.status);
        }

        return clone(accountStatus.data[where]);
    }

    return null;

};

function ProfileAvatarMenu() {
    const mx = initMatrix.matrixClient;
    const user = mx.getUser(mx.getUserId());
    const customStatusRef = useRef(null);
    const statusRef = useRef(null);

    // Get Display
    const [profile, setProfile] = useState({
        userId: user.userId,
        avatarUrl: null,
        displayName: user.displayName,
    });

    useEffect(() => {

        // Get User and update data
        const user2 = mx.getUser(mx.getUserId());

        // Set New User Status
        const onProfileUpdate = (event = {}) => {

            if (event) {

                const tinyEvent = event;
                const eventJSON = JSON.stringify(tinyEvent);

                if (eventJSON.length > 0 /* && (typeof user2.presenceStatusMsg !== 'string' || user2.presenceStatusMsg !== eventJSON) */) {

                    let presenceStatus = 'online';
                    if (typeof tinyEvent.status === 'string') {
                        tinyEvent.status = tinyEvent.status.trim();
                        if (tinyEvent.status === '🔘') presenceStatus = 'offline';
                    }

                    mx.setPresence({
                        presence: presenceStatus,
                        status_msg: eventJSON,
                    });

                }

                if (customStatusRef && customStatusRef.current && (
                    (typeof event.msg === 'string' && event.msg.length > 0) ||
                    (typeof event.msgIcon === 'string' && event.msgIcon.length > 0)
                )) {

                    const content = getPresence({ presenceStatusMsg: eventJSON });
                    const htmlStatus = [];

                    if (typeof content.presenceStatusMsg.msgIcon === 'string' && content.presenceStatusMsg.msgIcon.length > 0) {
                        htmlStatus.push($('<img>', { src: content.presenceStatusMsg.msgIcon, alt: 'icon', class: 'emoji me-1' }));
                    }

                    if (typeof content.presenceStatusMsg.msg === 'string' && content.presenceStatusMsg.msg.length > 0) {
                        htmlStatus.push(jReact(<span className='text-truncate cs-text'>
                            {twemojifyReact(content.presenceStatusMsg.msg.substring(0, 100))}
                        </span>));
                    }

                    $(customStatusRef.current).html(htmlStatus);
                    accountStatus.data = content.presenceStatusMsg;
                    accountStatus.status = event.status;

                } else {
                    $(customStatusRef.current).html(jReact(twemojifyReact(user2.userId)));
                    accountStatus.data = null;
                    accountStatus.status = null;
                }

                if (statusRef && statusRef.current && typeof event.status === 'string' && event.status.length > 0) {
                    const tinyUser = mx.getUser(mx.getUserId());
                    tinyUser.presenceStatusMsg = JSON.stringify(event);
                    statusRef.current.className = getUserStatus(user2);
                }

            } else {
                accountStatus.data = null;
                accountStatus.status = null;
            }

            tinyAPI.emit('userStatusUpdate', accountStatus);

        };

        onProfileUpdate(mx.getAccountData('pony.house.profile')?.getContent() ?? {});
        const setNewProfile = (avatarUrl, displayName, userId) => setProfile({
            avatarUrl: avatarUrl || null,
            displayName: displayName || profile.displayName,
            userId: userId || profile.userId
        });

        const onAvatarChange = (event, myUser) => {
            setNewProfile(myUser.avatarUrl, myUser.displayName, myUser.userId);
        };

        mx.getProfileInfo(mx.getUserId()).then((info) => {
            setNewProfile(info.avatar_url, info.displayname, info.userId);
        });

        // Socket
        user2.on('User.avatarUrl', onAvatarChange);
        navigation.on(cons.events.navigation.PROFILE_UPDATED, onProfileUpdate);
        return () => {
            user2.removeListener('User.avatarUrl', onAvatarChange);
            navigation.removeListener(
                cons.events.navigation.PROFILE_UPDATED,
                onProfileUpdate,
            );
        };

    }, []);

    const content = mx.getAccountData('pony.house.profile')?.getContent() ?? {};
    user.presence = 'online';
    user.presenceStatusMsg = JSON.stringify(content);
    const newStatus = getUserStatus(user);

    // Complete
    return (
        <table className="table table-borderless align-middle m-0" id='user-menu'>
            <tbody>
                <tr>

                    <td className="sidebar-photo p-0">

                        <button className="btn btn-bg btn-link btn-sm ms-2 text-truncate text-start " onClick={() => openSettings(settingTabText.PROFILE)} type="button">
                            <Avatar
                                className='d-inline-block float-start'
                                text={profile.displayName}
                                bgColor={colorMXID(mx.getUserId())}
                                size="normal"
                                imageAnimSrc={profile.avatarUrl !== null ? mx.mxcUrlToHttp(profile.avatarUrl) : null}
                                imageSrc={profile.avatarUrl !== null ? mx.mxcUrlToHttp(profile.avatarUrl, 42, 42, 'crop') : null}
                                isDefaultImage
                            />
                            <i ref={statusRef} className={newStatus} />
                            <div className="very-small ps-2 text-truncate emoji-size-fix-2" id='display-name' >{profile.displayName}</div>
                            <div ref={customStatusRef} className="very-small ps-2 text-truncate emoji-size-fix-2 user-custom-status" id='user-presence' >{profile.userId}</div>
                            <div className="very-small ps-2 text-truncate emoji-size-fix-2" id='user-id' >{profile.userId}</div>
                        </button>


                    </td>

                    <td className="p-0 pe-3 py-1 text-end">
                        <IconButton fa="fa-solid fa-gear" onClick={openSettings} />
                    </td>
                </tr>



            </tbody>
        </table>
    );

}

export default ProfileAvatarMenu;