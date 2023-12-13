import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact, twemojify } from '../../../util/twemojify';

import Avatar from '../../atoms/avatar/Avatar';
import { getUserStatus, updateUserStatusIcon, getPresence } from '../../../util/onlineStatus';
import initMatrix from '../../../client/initMatrix';
import { cssColorMXID } from '../../../util/colorMXID';
import { addToDataFolder, getDataList } from '../../../util/selectedRoom';
import { objType, toast } from '../../../util/tools';
import { copyToClipboard } from '../../../util/common';
import copyText from '../../organisms/profile-viewer/copyText';
import { getAppearance, getAnimatedImageUrl } from '../../../util/libs/appearance';
import moment, { momentFormat } from '../../../util/libs/momentjs';

const timezoneAutoUpdate = { text: null, html: null, value: null };
setInterval(() => {
  if (timezoneAutoUpdate.html && timezoneAutoUpdate.value) {

    let timezoneText = 'null';
    try {
      timezoneText = moment().tz(timezoneAutoUpdate.value).format(`MMMM Do YYYY, ${momentFormat.clock()}`);
    } catch {
      timezoneText = 'ERROR!';
    }

    timezoneAutoUpdate.text = timezoneText;
    timezoneAutoUpdate.html.text(timezoneText);

  }
}, 60000);

function PeopleSelectorBanner({
  name, color, user
}) {

  const statusRef = useRef(null);
  const customStatusRef = useRef(null);
  const profileBanner = useRef(null);
  const userNameRef = useRef(null);
  const userPronounsRef = useRef(null);
  const displayNameRef = useRef(null);
  const profileAvatar = useRef(null);

  const timezoneRef = useRef(null);
  const bioRef = useRef(null);
  const noteRef = useRef(null);

  const [avatarUrl, setUserAvatar] = useState(user ? user?.avatarUrl : null);

  const mx = initMatrix.matrixClient;

  // Copy Profile Username
  const copyUsername = {
    tag: (event) => copyText(event, 'Username successfully copied to the clipboard.'),
    display: (event) => copyText(event, 'Display name successfully copied to the clipboard.'),
  };

  const getCustomStatus = (content) => {

    // Get Status
    const customStatus = $(customStatusRef.current);
    const htmlStatus = [];
    let customStatusImg;
    const isOffline = (content.presence === 'offline' || content.presence === 'unavailable');

    if (content && objType(content.presenceStatusMsg, 'object')) {

      const presence = content.presenceStatusMsg;
      const ethereumValid = (presence.ethereum && presence.ethereum.valid);

      // Ethereum
      if (ethereumValid) {

        const displayName = $(displayNameRef.current);
        let ethereumIcon = displayName.find('#dm-ethereum-icon');
        if (ethereumIcon.length < 1) {

          ethereumIcon = $('<span>', { id: 'dm-ethereum-icon', class: 'ms-2', title: presence.ethereum.address }).append(
            $('<i>', { class: 'fa-brands fa-ethereum' })
          );

          ethereumIcon.on('click', () => {
            try {
              copyToClipboard(presence.ethereum.address);
              toast('Ethereum address successfully copied to the clipboard.');
            } catch (err) {
              console.error(err);
              alert(err.message);
            }
          }).tooltip();

          displayName.append(ethereumIcon);

        }

      }

      // Get Pronouns Data
      if (userPronounsRef.current) {

        const pronounsDOM = $(userPronounsRef.current);

        // Message Icon
        if (typeof presence.pronouns === 'string' && presence.pronouns.length > 0) {
          pronounsDOM.removeClass('d-none').text(presence.pronouns);
        } else {
          pronounsDOM.empty().addClass('d-none');
        }

      }

      // Get Bio Data
      if (bioRef.current) {

        const bioDOM = $(bioRef.current);
        const tinyBio = $('#dm-tiny-bio');

        if (tinyBio.length > 0) {

          bioDOM.removeClass('d-none')
          if (typeof presence.bio === 'string' && presence.bio.length > 0) {
            tinyBio.html(twemojify(presence.bio.substring(0, 190), undefined, true, false));
          } else {
            bioDOM.addClass('d-none')
            tinyBio.html('');
          }

        } else {
          bioDOM.addClass('d-none')
        }

      }

      // Get Timezone Data
      if (timezoneRef.current) {

        const timezoneDOM = $(timezoneRef.current);
        const tinyTimezone = $('#dm-tiny-timezone');

        if (tinyTimezone.length > 0) {

          timezoneDOM.removeClass('d-none');
          if (typeof presence.timezone === 'string' && presence.timezone.length > 0) {

            let timezoneText = 'null';
            try {
              timezoneText = moment().tz(presence.timezone).format(`MMMM Do YYYY, ${momentFormat.clock()}`);
            } catch {
              timezoneText = 'ERROR!';
              timezoneDOM.addClass('d-none');
            }

            if (timezoneAutoUpdate.html) delete timezoneAutoUpdate.html;

            timezoneAutoUpdate.html = tinyTimezone;
            timezoneAutoUpdate.value = presence.timezone;
            timezoneAutoUpdate.text = timezoneText;

            tinyTimezone.text(timezoneText);

          } else {
            timezoneDOM.addClass('d-none');
            tinyTimezone.html('');
          }

        } else {
          timezoneDOM.addClass('d-none');
        }

      }

      // Message Icon
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

    // Custom Status
    customStatus.html(htmlStatus);
    if (!isOffline) {
      customStatus.removeClass('d-none');
    } else {
      customStatus.addClass('d-none');
    }

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
        setUserAvatar(tinyData?.avatarUrl);

        // Update Status Icon
        getCustomStatus(updateUserStatusIcon(status, tinyUser));

      };

      // Read Events
      const tinyNote = getDataList('user_cache', 'note', user.userId);

      const tinyNoteSpacing = (event) => {
        const element = event.target;
        element.style.height = "5px";
        element.style.height = `${Number(element.scrollHeight)}px`;
      };

      // Update Note
      const tinyNoteUpdate = (event) => {
        addToDataFolder('user_cache', 'note', user.userId, $(event.target).val(), 500);
      };

      // Read Events
      user.on('User.avatarUrl', updateProfileStatus);
      user.on('User.currentlyActive', updateProfileStatus);
      user.on('User.lastPresenceTs', updateProfileStatus);
      user.on('User.presence', updateProfileStatus);
      $(displayNameRef.current).find('> .button').on('click', copyUsername.display);
      $(userNameRef.current).find('> .button').on('click', copyUsername.tag);
      $(noteRef.current).on('change', tinyNoteUpdate).on('keypress keyup keydown', tinyNoteSpacing).val(tinyNote);
      return () => {
        $(displayNameRef.current).find('> .button').off('click', copyUsername.display);
        $(userNameRef.current).find('> .button').off('click', copyUsername.tag);
        $(noteRef.current).off('change', tinyNoteUpdate).off('keypress keyup keydown', tinyNoteSpacing);
        user.removeListener('User.currentlyActive', updateProfileStatus);
        user.removeListener('User.lastPresenceTs', updateProfileStatus);
        user.removeListener('User.presence', updateProfileStatus);
        user.removeListener('User.avatarUrl', updateProfileStatus);
      };

    }
  }, [user]);

  if (user) {

    const appearanceSettings = getAppearance();

    return <>

      <div ref={profileBanner} className={`profile-banner profile-bg${cssColorMXID(user.userId)}`} />

      <div className='text-center profile-user-profile-avatar'>
        <Avatar
          ref={profileAvatar}
          imageSrc={mx.mxcUrlToHttp(avatarUrl, 100, 100, 'crop')}
          imageAnimSrc={!appearanceSettings.enableAnimParams ? mx.mxcUrlToHttp(avatarUrl) : getAnimatedImageUrl(mx.mxcUrlToHttp(avatarUrl, 100, 100, 'crop'))}
          text={name} bgColor={color} size="large"
          isDefaultImage
        />
        <i ref={statusRef} className={`user-status pe-2 ${getUserStatus(user)}`} />
      </div>

      <div className='card bg-bg mx-3 text-start'>
        <div className='card-body'>

          <h6 ref={displayNameRef} className='emoji-size-fix m-0 mb-1 fw-bold display-name'><span className='button'>{twemojifyReact(name)}</span></h6>
          <small ref={userNameRef} className='text-gray emoji-size-fix username'><span className='button'>{twemojifyReact(user.userId)}</span></small>
          <div ref={userPronounsRef} className='text-gray emoji-size-fix pronouns small d-none' />

          <div ref={customStatusRef} className='d-none mt-2 emoji-size-fix small user-custom-status' />

          <div ref={timezoneRef} className='d-none'>

            <hr />

            <div className='text-gray text-uppercase fw-bold very-small mb-2'>Timezone</div>
            <div id='dm-tiny-timezone' className='emoji-size-fix small text-freedom' />

          </div>

          <div ref={bioRef} className='d-none'>

            <hr />

            <div className='text-gray text-uppercase fw-bold very-small mb-2'>About me</div>
            <div id='dm-tiny-bio' className='emoji-size-fix small text-freedom' />

          </div>

          <hr />

          <label htmlFor="tiny-note" className="form-label text-gray text-uppercase fw-bold very-small mb-2">Note</label>
          <textarea ref={noteRef} spellCheck="false" className="form-control form-control-bg emoji-size-fix small" id="tiny-note" placeholder="Insert a note here" />


        </div>
      </div>

    </>;

  }

  return null;

}

PeopleSelectorBanner.defaultProps = {
  user: null,
};

PeopleSelectorBanner.propTypes = {
  user: PropTypes.object,
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default PeopleSelectorBanner;
