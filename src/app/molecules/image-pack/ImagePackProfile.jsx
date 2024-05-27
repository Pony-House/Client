import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { openReusableContextMenu } from '../../../client/action/navigation';
import { getEventCords } from '../../../util/common';

import Text from '../../atoms/text/Text';
import Avatar from '../../atoms/avatar/Avatar';
import Button from '../../atoms/button/Button';
import IconButton from '../../atoms/button/IconButton';
import Input from '../../atoms/input/Input';
import ImageUpload from '../image-upload/ImageUpload';
import ImagePackUsageSelector from './ImagePackUsageSelector';

function ImagePackProfile({
  avatarUrl = null,
  displayName,
  attribution = null,
  usage,
  onUsageChange = null,
  onAvatarChange = null,
  onEditProfile = null,
}) {
  const [isEdit, setIsEdit] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const { nameInput, attributionInput } = e.target;
    const name = nameInput.value.trim() || undefined;
    const att = attributionInput.value.trim() || undefined;

    onEditProfile(name, att);
    setIsEdit(false);
  };

  const handleUsageSelect = (event) => {
    openReusableContextMenu('bottom', getEventCords(event, '.btn-link'), (closeMenu) => (
      <ImagePackUsageSelector
        usage={usage}
        onSelect={(newUsage) => {
          onUsageChange(newUsage);
          closeMenu();
        }}
      />
    ));
  };

  return (
    <div className="image-pack-profile">
      {onAvatarChange ? (
        <ImageUpload
          bgColor="#555"
          text={displayName}
          imageSrc={avatarUrl}
          size="normal"
          onUpload={onAvatarChange}
          onRequestRemove={() => onAvatarChange(undefined)}
        />
      ) : (
        <Avatar
          bgColor="#555"
          text={displayName}
          imageSrc={avatarUrl}
          className="profile-image-container"
          size="normal"
        />
      )}
      <div className="image-pack-profile__content noselect">
        {isEdit ? (
          <form onSubmit={handleSubmit}>
            <div>
              <Input name="nameInput" label="Name" value={displayName} required />
            </div>
            <div>
              <Input name="attributionInput" label="Attribution" value={attribution} resizable />
            </div>
            <div>
              <Button variant="primary" type="submit">
                Save
              </Button>
              <Button onClick={() => setIsEdit(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <div>
              <Text>{displayName}</Text>
              {onEditProfile && (
                <IconButton
                  size="extra-small"
                  onClick={() => setIsEdit(true)}
                  fa="fa-solid fa-pencil"
                  tooltip="Edit"
                />
              )}
            </div>
            {attribution && <div className="very-small text-gray">{attribution}</div>}
          </>
        )}
      </div>
      <div className="image-pack-profile__usage noselect">
        <div className="very-small text-gray">Pack usage</div>
        <Button
          onClick={onUsageChange ? handleUsageSelect : undefined}
          faSrc={onUsageChange ? 'fa-solid fa-check' : null}
        >
          <Text>
            {usage === 'emoticon' && 'Emoji'}
            {usage === 'sticker' && 'Sticker'}
            {usage === 'both' && 'Both'}
          </Text>
        </Button>
      </div>
    </div>
  );
}

ImagePackProfile.propTypes = {
  avatarUrl: PropTypes.string,
  displayName: PropTypes.string.isRequired,
  attribution: PropTypes.string,
  usage: PropTypes.oneOf(['emoticon', 'sticker', 'both']).isRequired,
  onUsageChange: PropTypes.func,
  onAvatarChange: PropTypes.func,
  onEditProfile: PropTypes.func,
};

export default ImagePackProfile;
