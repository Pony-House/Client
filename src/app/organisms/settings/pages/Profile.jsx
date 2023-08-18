import React, { useState, useRef } from 'react';

import initMatrix from '../../../../client/initMatrix';
import { getEventCords } from '../../../../util/common';
import { emitUpdateProfile, openEmojiBoard } from '../../../../client/action/navigation';
import { TWEMOJI_BASE_URL, twemojifyIcon } from '../../../../util/twemojify';
import Button from '../../../atoms/button/Button';
import IconButton from '../../../atoms/button/IconButton';
import ProfileEditor from '../../profile-editor/ProfileEditor';
import { MenuItem } from '../../../atoms/context-menu/ContextMenu';
import RadioButton from '../../../atoms/button/RadioButton';
import ImageUpload from '../../../molecules/image-upload/ImageUpload';
import { toast } from '../../../../util/tools';
import { getStatusCSS } from '../../../../util/onlineStatus';
import { confirmDialog } from '../../../molecules/confirm-dialog/ConfirmDialog';
import defaultAvatar from '../../../atoms/avatar/defaultAvatar';

function ProfileSection() {

    const userProfile = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};

    const customStatusRef = useRef(null);
    const bioRef = useRef(null);

    const [customStatusIcon, setcustomStatusIcon] = useState(typeof userProfile.msgIcon === 'string' ?
        userProfile.msgIcon.length <= 2 ? twemojifyIcon(userProfile.msgIcon) : initMatrix.matrixClient.mxcUrlToHttp(userProfile.msgIcon)
        : defaultAvatar(1));

    const [customStatusValue, setcustomStatusValue] = useState(typeof userProfile.msgIcon === 'string' ? userProfile.msgIcon : null);

    const [profileStatus, setProfileStatus] = useState(userProfile.status ? userProfile.status : 'online');
    const [banner, setBanner] = useState(userProfile.banner);
    const [customStatus, setCustomStatus] = useState(userProfile.msg);
    const [userBio, setUserBio] = useState(userProfile.bio);

    const sendSetStatus = (item) => {
        const content = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};
        setProfileStatus(item.type);
        content.status = item.type;
        initMatrix.matrixClient.setAccountData('pony.house.profile', content);
        emitUpdateProfile(content);
    };

    const sendCustomStatus = () => {
        if (customStatusRef && customStatusRef.current) {

            const content = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};

            const { value } = customStatusRef.current;

            if (
                (typeof value === 'string' && value.length > 0) ||
                (typeof customStatusValue === 'string' && customStatusValue.length > 0)
            ) {

                if (typeof value === 'string' && value.length > 0) {
                    setCustomStatus(value);
                    content.msg = value;
                } else {
                    setCustomStatus(null);
                    content.msg = null;
                }

                if (typeof customStatusValue === 'string' && customStatusValue.length > 0) {
                    content.msgIcon = customStatusValue;
                } else {
                    content.msgIcon = null;
                }

            } else {

                setCustomStatus(null);
                content.msg = null;

                content.msgIcon = null;

            }

            initMatrix.matrixClient.setAccountData('pony.house.profile', content);
            emitUpdateProfile(content);

            toast('The custom status of your profile has been successfully defined.');

        }
    };

    const sendBio = () => {
        if (bioRef && bioRef.current) {

            const content = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};

            const { value } = bioRef.current;
            if (typeof value === 'string' && value.length > 0) {
                setUserBio(value);
                content.bio = value;
            } else {
                setUserBio(null);
                content.bio = null;
            }

            initMatrix.matrixClient.setAccountData('pony.house.profile', content);
            emitUpdateProfile(content);

            toast('The biography of your profile has been successfully updated.');

        }
    };

    const items = [
        {
            type: '🟢',
            text: 'Online',
            faSrc: `${getStatusCSS('online')} user-presence-online`,
        },
        {
            type: '🟠',
            text: 'Idle',
            faSrc: `${getStatusCSS('idle')} user-presence-idle`,
        },
        {
            type: '🔴',
            text: 'Do not disturb',
            faSrc: `${getStatusCSS('dnd')} user-presence-dnd`,
        },
        {
            type: '🔘',
            text: 'Invisible',
            faSrc: `${getStatusCSS('offline')} user-presence-offline`,
        }
    ];

    let bannerSrc;
    if (typeof banner === 'string' && banner.length > 0) {
        bannerSrc = initMatrix.matrixClient.mxcUrlToHttp(banner, 400, 227);
    }

    const handleBannerUpload = async url => {

        const content = initMatrix.matrixClient.getAccountData('pony.house.profile')?.getContent() ?? {};

        const bannerPlace = $('.space-banner .avatar__border');
        const bannerImg = $('.space-banner img');

        if (url === null) {

            const isConfirmed = await confirmDialog(
                'Remove profile banner',
                'Are you sure that you want to remove banner?',
                'Remove',
                'warning',
            );

            if (isConfirmed) {

                setBanner(null);
                content.banner = null;
                initMatrix.matrixClient.setAccountData('pony.house.profile', content);
                emitUpdateProfile(content);

                bannerPlace.css('background-image', '').removeClass('banner-added');
                bannerImg.attr('src', '');

            }

        } else {

            setBanner(url);
            content.banner = url;
            initMatrix.matrixClient.setAccountData('pony.house.profile', content);
            emitUpdateProfile(content);

            bannerPlace.css('background-image', `url('${initMatrix.matrixClient.mxcUrlToHttp(url, 660, 227)}')`).addClass('banner-added');
            bannerImg.attr('src', initMatrix.matrixClient.mxcUrlToHttp(url, 400, 227));

        }

    };

    return (<>

        {window.matchMedia('screen and (min-width: 768px)').matches ? <div className="card noselect mb-3">
            <ul className="list-group list-group-flush">

                <li className="list-group-item very-small text-gray">Account ID</li>

                <li className="list-group-item border-0">
                    <ProfileEditor userId={initMatrix.matrixClient.getUserId()} />
                </li>

            </ul></div> : null}

        <div className="card noselect mb-3">
            <ul className="list-group list-group-flush">

                <li className="list-group-item very-small text-gray">Status</li>

                <li className="list-group-item border-0">
                    <div className='small'>Status</div>
                    <div className='very-small text-gray'>Choose the current status of your profile.</div>
                </li>

                {items.map((item) => (
                    <MenuItem
                        className={profileStatus === item.type ? 'text-start btn-text-success' : 'text-start'}
                        faSrc={item.faSrc}
                        key={item.type}
                        onClick={() => sendSetStatus(item)}
                    >

                        {item.text}
                        <span className='ms-4 float-end'>
                            <RadioButton isActive={profileStatus === item.type} />
                        </span>

                    </MenuItem>
                ))}

                <li className="list-group-item border-0">
                    <div className='small'>Custom Status</div>
                    <div className='very-small text-gray'>Enter a status that will appear next to your name.</div>
                    <div className="input-group">
                        <span className="input-group-text" id="basic-addon1">

                            {customStatusValue ? <IconButton fa="fa-solid fa-xmark" className='btn-sm me-2' onClick={() => {
                                setcustomStatusIcon(defaultAvatar(1));
                                setcustomStatusValue(null);
                            }} /> : null}

                            <img id='change-custom-status-img' className='img-fluid' src={customStatusIcon} alt='custom-status' onClick={(e) => {
                                if (!$(e.target).hasClass('disabled')) {

                                    const cords = getEventCords(e);
                                    cords.x -= (document.dir === 'rtl' ? -80 : 280) - 200;
                                    cords.y -= 230;

                                    const tinyOpenEmojis = () => {
                                        openEmojiBoard(null, cords, 'emoji', emoji => {

                                            if (emoji.mxc) {
                                                setcustomStatusIcon(initMatrix.matrixClient.mxcUrlToHttp(emoji.mxc));
                                                setcustomStatusValue(emoji.mxc);
                                            } else if (emoji.unicode) {
                                                setcustomStatusIcon(`${TWEMOJI_BASE_URL}72x72/${emoji.hexcode.toLowerCase()}.png`);
                                                setcustomStatusValue(emoji.unicode);
                                            } else {
                                                setcustomStatusIcon(defaultAvatar(1));
                                                setcustomStatusValue(null);
                                            }

                                            e.target.click();

                                        });
                                    };

                                    tinyOpenEmojis();

                                }
                            }} />

                        </span>
                        <input ref={customStatusRef} className="form-control form-control-bg" type="text" placeholder="" maxLength="100" defaultValue={customStatus} />
                    </div>
                    <Button className='mt-2' onClick={sendCustomStatus} variant="primary">Submit</Button>
                </li>

            </ul></div>

        <div className="card noselect">
            <ul className="list-group list-group-flush">
                <li className="list-group-item very-small text-gray">Info</li>

                <li className="list-group-item border-0">
                    <div className='small'>About me</div>
                    <div className='very-small text-gray'>Enter a small biography about you.</div>
                    <textarea ref={bioRef} className="form-control form-control-bg" placeholder="" rows="7" maxLength="190" defaultValue={userBio} />
                    <Button className='mt-2' onClick={sendBio} variant="primary">Submit</Button>
                </li>

                <li className="list-group-item border-0">

                    <div className='small'>Banner</div>

                    <div className="very-small text-gray">
                        <p>This image will display at the top of your profile.</p>
                        The recommended minimum size is 1500x500 and recommended aspect ratio is 16:9.
                    </div>

                    <ImageUpload
                        className='space-banner profile-banner'
                        text='Banner'
                        imageSrc={bannerSrc}
                        onUpload={handleBannerUpload}
                        onRequestRemove={() => handleBannerUpload(null)}
                    />
                </li>

            </ul>
        </div>

    </>
    );

};

export default ProfileSection;