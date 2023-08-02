import React from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact } from '../../../util/twemojify';
import { colorMXID } from '../../../util/colorMXID';

import Text from '../../atoms/text/Text';
import Avatar from '../../atoms/avatar/Avatar';
import NotificationBadge from '../../atoms/badge/NotificationBadge';
import { blurOnBubbling } from '../../atoms/button/script';

function RoomSelectorWrapper({
  isSelected, isMuted, isUnread, onClick,
  content, options, onContextMenu,
}) {
  const classes = ['room-selector'];
  if (isMuted) classes.push('room-selector--muted');
  if (isUnread) classes.push('room-selector--unread');
  if (isSelected) classes.push('room-selector--selected');

  return (
    <div className={classes.join(' ')}>
      <button
        className="room-selector__content emoji-size-fix"
        type="button"
        onClick={onClick}
        onMouseUp={(e) => blurOnBubbling(e, '.room-selector__content')}
        onContextMenu={onContextMenu}
      >
        {content}
      </button>
      <div className="room-selector__options">{options}</div>
    </div>
  );
}
RoomSelectorWrapper.defaultProps = {
  isMuted: false,
  options: null,
  onContextMenu: null,
};
RoomSelectorWrapper.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  isMuted: PropTypes.bool,
  isUnread: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  content: PropTypes.node.isRequired,
  options: PropTypes.node,
  onContextMenu: PropTypes.func,
};

function RoomSelector({
  name, parentName, roomId, imageSrc, imageAnimSrc, animParentsCount, iconSrc,
  isSelected, isMuted, isUnread, notificationCount, isAlert,
  options, onClick, onContextMenu, isProfile, notSpace,
}) {
  return (
    <RoomSelectorWrapper
      isSelected={isSelected}
      isMuted={isMuted}
      isUnread={isUnread}
      content={(
        <>
          <Avatar
            text={name}
            bgColor={colorMXID(roomId)}
            imageSrc={imageSrc}
            animParentsCount={animParentsCount}
            imageAnimSrc={imageAnimSrc}
            iconColor="var(--ic-surface-low)"
            iconSrc={!isProfile ? iconSrc : null}
            faSrc={isProfile ? 'bi bi-person-badge-fill profile-icon-fa' : null}
            size="extra-small"
            isDefaultImage={(!iconSrc || notSpace)}
          />
          <Text variant="b1" weight={isUnread ? 'medium' : 'normal'}>
            {twemojifyReact(name)}
            {parentName && (
              <span className="very-small text-gray">
                {' — '}
                {twemojifyReact(parentName)}
              </span>
            )}
          </Text>
          {isUnread && (
            <NotificationBadge
              alert={isAlert}
              content={notificationCount !== 0 ? notificationCount : null}
            />
          )}
        </>
      )}
      options={options}
      onClick={onClick}
      onContextMenu={onContextMenu}
    />
  );
}
RoomSelector.defaultProps = {
  animParentsCount: 4,
  notSpace: false,
  isProfile: false,
  parentName: null,
  isSelected: false,
  imageSrc: null,
  imageAnimSrc: null,
  iconSrc: null,
  isMuted: false,
  options: null,
  onContextMenu: null,
};
RoomSelector.propTypes = {
  animParentsCount: PropTypes.number,
  notSpace: PropTypes.bool,
  isProfile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  parentName: PropTypes.string,
  roomId: PropTypes.string.isRequired,
  imageSrc: PropTypes.string,
  imageAnimSrc: PropTypes.string,
  iconSrc: PropTypes.string,
  isSelected: PropTypes.bool,
  isMuted: PropTypes.bool,
  isUnread: PropTypes.bool.isRequired,
  notificationCount: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  isAlert: PropTypes.bool.isRequired,
  options: PropTypes.node,
  onClick: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func,
};

export default RoomSelector;
