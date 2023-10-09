import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact, twemojify } from '../../../util/twemojify';

import Avatar from '../../atoms/avatar/Avatar';
import { getUserStatus, updateUserStatusIcon, getPresence } from '../../../util/onlineStatus';
import initMatrix from '../../../client/initMatrix';
import { colorMXID, cssColorMXID } from '../../../util/colorMXID';

function PeopleSelectorBanner({
  avatarSrc, avatarAnimSrc, name, color, peopleRole, user, disableStatus
}) {

  const mx = initMatrix.matrixClient;
  const statusRef = useRef(null);
  const customStatusRef = useRef(null);
  const profileBanner = useRef(null);
  const userNameRef = useRef(null);
  const displayNameRef = useRef(null);
  const profileAvatar = useRef(null);

  const getCustomStatus = (content) => {

    // Get Status
    const customStatus = $(customStatusRef.current);
    const htmlStatus = [];
    let customStatusImg;
    const isOffline = (content.presence !== 'offline' && content.presence !== 'unavailable');

    if (
      content && content.presenceStatusMsg &&
      (
        (typeof content.presenceStatusMsg.msg === 'string' && content.presenceStatusMsg.msg.length > 0) ||
        (typeof content.presenceStatusMsg.msgIcon === 'string' && content.presenceStatusMsg.msgIcon.length > 0)
      )
    ) {

      const presence = content.presenceStatusMsg;

      if (typeof presence.msgIcon === 'string' && presence.msgIcon.length > 0) {

        customStatusImg = $('<img>', { src: presence.msgIconThumb, alt: 'icon', class: 'emoji me-1' });
        htmlStatus.push(customStatusImg);

        customStatusImg.data('pony-house-cs-normal', presence.msgIconThumb);
        customStatusImg.data('pony-house-cs-hover', presence.msgIcon);

      }

      if (typeof presence.msg === 'string' && presence.msg.length > 0) {
        htmlStatus.push($('<span>', { class: 'text-truncate cs-text' }).html(twemojify(presence.msg.substring(0, 100))));
      }

      // Get Banner Data
      const bannerDOM = $(profileBanner.current);

      if (bannerDOM.length > 0) {
        if (typeof presence.banner === 'string' && presence.banner.length > 0) {
          bannerDOM.css('background-image', `url("${presence.banner}")`).addClass('exist-banner');
        } else {
          bannerDOM.css('background-image', '').removeClass('exist-banner');
        }
      }

    }

    customStatus.html(htmlStatus);

    if (customStatusImg) {
      customStatusImg.parent().parent().parent().hover(
        () => {
          customStatusImg.attr('src', customStatusImg.data('pony-house-cs-hover'));
        }, () => {
          customStatusImg.attr('src', customStatusImg.data('pony-house-cs-normal'));
        }
      );
    }

  };

  if (user) {
    getCustomStatus(getPresence(user));
  }

  useEffect(() => {
    if (user) {

      // Update Status Profile
      const updateProfileStatus = (mEvent, tinyData) => {

        // Get Status
        const status = $(statusRef.current);
        const tinyUser = tinyData;

        // Update Status Icon
        getCustomStatus(updateUserStatusIcon(status, tinyUser));

      };

      // Read Events
      user.on('User.currentlyActive', updateProfileStatus);
      user.on('User.lastPresenceTs', updateProfileStatus);
      user.on('User.presence', updateProfileStatus);
      return () => {
        user.removeListener('User.currentlyActive', updateProfileStatus);
        user.removeListener('User.lastPresenceTs', updateProfileStatus);
        user.removeListener('User.presence', updateProfileStatus);
      };

    }
  }, [user]);

  return <>

    <div ref={profileBanner} className={`profile-banner profile-bg${cssColorMXID(user.userId)}`} />

    <div className='text-center profile-user-profile-avatar'>
      <Avatar ref={profileAvatar} imageSrc={mx.mxcUrlToHttp(user.avatarUrl, 100, 100, 'crop')} imageAnimSrc={mx.mxcUrlToHttp(user.avatarUrl)} text={name} bgColor={colorMXID(user.userId)} size="large" isDefaultImage />
      <i ref={statusRef} className={`user-status pe-2 ${getUserStatus(user)}`} />
    </div>

    <h6 ref={displayNameRef} className='emoji-size-fix m-0 mb-1 fw-bold display-name'><span className='button'>{twemojifyReact(name)}</span></h6>
    <small ref={userNameRef} className='text-gray emoji-size-fix username'><span className='button'>{twemojifyReact(user.userId)}</span></small>

  </>;

}

PeopleSelectorBanner.defaultProps = {
  avatarAnimSrc: null,
  avatarSrc: null,
  peopleRole: null,
  user: null,
  disableStatus: false,
};

PeopleSelectorBanner.propTypes = {
  disableStatus: PropTypes.bool,
  user: PropTypes.object,
  avatarAnimSrc: PropTypes.string,
  avatarSrc: PropTypes.string,
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  peopleRole: PropTypes.string,
};

export default PeopleSelectorBanner;
