import React from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact, twemojify } from '../../../util/twemojify';

import { blurOnBubbling } from '../../atoms/button/script';

import Text from '../../atoms/text/Text';
import Avatar from '../../atoms/avatar/Avatar';
import { getUserStatus, updateUserStatusIcon, getPresence } from '../../../util/onlineStatus';
import initMatrix from '../../../client/initMatrix';

function PeopleSelector({
  avatarSrc, avatarAnimSrc, name, color, peopleRole, onClick, user, disableStatus
}) {

  const statusRef = React.useRef(null);
  const customStatusRef = React.useRef(null);

  const getCustomStatus = (content) => {

    // Custom Status
    if (customStatusRef && customStatusRef.current) {

      // Get Status
      const customStatus = $(customStatusRef.current);
      const htmlStatus = [];
      let customStatusImg;

      if (
        content && content.presenceStatusMsg &&
        content.presence !== 'offline' && content.presence !== 'unavailable' && (
          (typeof content.presenceStatusMsg.msg === 'string' && content.presenceStatusMsg.msg.length > 0) ||
          (typeof content.presenceStatusMsg.msgIcon === 'string' && content.presenceStatusMsg.msgIcon.length > 0)
        )
      ) {

        if (typeof content.presenceStatusMsg.msgIcon === 'string' && content.presenceStatusMsg.msgIcon.length > 0) {

          customStatusImg = $('<img>', { src: content.presenceStatusMsg.msgIconThumb, alt: 'icon', class: 'emoji me-1' });
          htmlStatus.push(customStatusImg);

          customStatusImg.data('pony-house-cs-normal', content.presenceStatusMsg.msgIconThumb);
          customStatusImg.data('pony-house-cs-hover', content.presenceStatusMsg.msgIcon);

        }

        if (typeof content.presenceStatusMsg.msg === 'string' && content.presenceStatusMsg.msg.length > 0) {
          htmlStatus.push($('<span>', { class: 'text-truncate cs-text' }).html(twemojify(content.presenceStatusMsg.msg.substring(0, 100))));
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

    }

  };

  if (user) {
    getCustomStatus(getPresence(user));
  }

  React.useEffect(() => {
    if (user) {

      // Update Status Profile
      const updateProfileStatus = (mEvent, tinyData) => {

        // Get Status
        const mx = initMatrix.matrixClient;
        const status = $(statusRef.current);
        const tinyUser = tinyData;

        // Is You
        if (tinyUser.userId === mx.getUserId()) {
          const yourData = mx.getAccountData('pony.house.profile')?.getContent() ?? {};
          tinyUser.presenceStatusMsg = JSON.stringify(yourData);
        }

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

  return (
    <button
      className="people-selector"
      onMouseUp={(e) => blurOnBubbling(e, '.people-selector')}
      onClick={onClick}
      type="button"
    >

      <Avatar imageAnimSrc={avatarAnimSrc} imageSrc={avatarSrc} text={name} bgColor={color} size="small" isDefaultImage />
      {!disableStatus ? <i ref={statusRef} className={getUserStatus(user)} /> : ''}

      <div className="small people-selector__name text-start">
        <span className='emoji-size-fix'>{twemojifyReact(name)}</span>
        <div ref={customStatusRef} className='very-small text-gray text-truncate emoji-size-fix-2 user-custom-status' />
      </div>

      {peopleRole !== null && <Text className="people-selector__role" variant="b3">{peopleRole}</Text>}

    </button>
  );

}

PeopleSelector.defaultProps = {
  avatarAnimSrc: null,
  avatarSrc: null,
  peopleRole: null,
  user: null,
  disableStatus: false,
};

PeopleSelector.propTypes = {
  disableStatus: PropTypes.bool,
  user: PropTypes.object,
  avatarAnimSrc: PropTypes.string,
  avatarSrc: PropTypes.string,
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  peopleRole: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default PeopleSelector;
