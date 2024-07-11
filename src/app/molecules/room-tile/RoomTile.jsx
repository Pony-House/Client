import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { convertUserId } from '@src/util/matrixUtil';
import matrixAppearance from '@src/util/libs/appearance';

import { twemojifyReact } from '../../../util/twemojify';

import { colorMXID } from '../../../util/colorMXID';

import Text from '../../atoms/text/Text';
import Avatar from '../../atoms/avatar/Avatar';

function RoomTile({
  avatarSrc = null,
  avatarAnimSrc = null,
  name,
  id,
  inviterName = null,
  memberCount = null,
  desc = null,
  options = null,
}) {
  const [, forceUpdate] = useReducer((count) => count + 1, 0);

  useEffect(() => {
    const tinyUpdate = () => forceUpdate();
    matrixAppearance.off('simplerHashtagSameHomeServer', tinyUpdate);
    return () => {
      matrixAppearance.off('simplerHashtagSameHomeServer', tinyUpdate);
    };
  });

  return (
    <div className="room-tile">
      <div className="room-tile__avatar">
        <Avatar
          className="profile-image-container"
          imageAnimSrc={avatarAnimSrc}
          imageSrc={avatarSrc}
          bgColor={colorMXID(id)}
          text={name}
          isDefaultImage
        />
      </div>
      <div className="room-tile__content emoji-size-fix">
        <Text variant="s1">{twemojifyReact(name)}</Text>
        <div className="very-small text-gray">
          {inviterName !== null
            ? `Invited by ${inviterName} to ${id}${memberCount === null ? '' : ` • ${memberCount} members`}`
            : convertUserId(id) + (memberCount === null ? '' : ` • ${memberCount} members`)}
        </div>
        {desc !== null && typeof desc === 'string' ? (
          <Text className="room-tile__content__desc emoji-size-fix" variant="b2">
            {twemojifyReact(desc, undefined, true)}
          </Text>
        ) : (
          desc
        )}
      </div>
      {options !== null && <div className="room-tile__options">{options}</div>}
    </div>
  );
}

RoomTile.propTypes = {
  avatarSrc: PropTypes.string,
  avatarAnimSrc: PropTypes.string,
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  inviterName: PropTypes.string,
  memberCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  desc: PropTypes.node,
  options: PropTypes.node,
};

export default RoomTile;
