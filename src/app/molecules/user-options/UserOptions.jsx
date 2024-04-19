import React from 'react';
import PropTypes from 'prop-types';

import muteUserManager from '@src/util/libs/muteUserManager';
import { twemojifyReact } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import { MenuBorder, MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';
import { tinyPrompt } from '../../../util/tools';
import { addToDataFolder, getDataList } from '../../../util/selectedRoom';

const nicknameSizeLimit = 30;

function UserOptions({ userId, afterOptionSelect }) {
  const mx = initMatrix.matrixClient;
  const user = mx.getUser(userId);
  const isWhitelist = getDataList('user_cache', 'whitelist', userId);

  return (
    <div className="noselect emoji-size-fix w-100" style={{ maxWidth: '256px' }}>
      <MenuHeader>{twemojifyReact(`User Options for ${user?.userId}`)}</MenuHeader>

      <MenuItem
        className="text-start"
        faSrc="fa-solid fa-user-pen"
        onClick={async () => {
          afterOptionSelect();

          const oldNickname = muteUserManager.getUsername(userId);
          const nickname = await tinyPrompt(
            `This information will only be visible to you. The new username will be visible after updating the page you are currently viewing.\n\nPlease type the user ${user?.userId} nickname here:`,
            'Friend Nickname',
            {
              placeholder: userId,
              value: oldNickname,
              maxlength: nicknameSizeLimit,
            },
            {
              key: (e) => {
                const input = $(e.target);
                const value = input.val();

                if (value.length > nicknameSizeLimit)
                  input.val(value.substring(0, nicknameSizeLimit));
              },
            },
          );

          if (typeof nickname === 'string') muteUserManager.changeUsername(userId, nickname);
        }}
      >
        Change Friend Nickname
      </MenuItem>

      {userId !== mx.getUserId() ? (
        <>
          <MenuItem
            className="text-start"
            faSrc="fa-solid fa-envelope-circle-check"
            onClick={() => {
              afterOptionSelect();
              if (isWhitelist) {
                addToDataFolder('user_cache', 'whitelist', userId, false);
              } else {
                addToDataFolder('user_cache', 'whitelist', userId, true);
              }
            }}
          >
            {!isWhitelist ? 'Add to Invite Whitelist' : 'Remove from Invite Whitelist'}
          </MenuItem>

          <MenuHeader>Filter user</MenuHeader>

          <MenuItem
            className="text-start"
            faSrc={
              !muteUserManager.isStickerMuted(userId) ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'
            }
            onClick={() => {
              afterOptionSelect();
              if (muteUserManager.isStickerMuted(userId)) {
                muteUserManager.muteSticker(userId, false);
              } else {
                muteUserManager.muteSticker(userId, true);
              }
            }}
          >
            {!muteUserManager.isStickerMuted(userId) ? 'Ignore user stickers' : 'See user stickers'}
          </MenuItem>

          <MenuBorder />

          <MenuItem
            className="text-start"
            faSrc={
              !muteUserManager.isImageMuted(userId) ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'
            }
            onClick={() => {
              afterOptionSelect();
              if (muteUserManager.isImageMuted(userId)) {
                muteUserManager.muteImage(userId, false);
              } else {
                muteUserManager.muteImage(userId, true);
              }
            }}
          >
            {!muteUserManager.isImageMuted(userId)
              ? 'Ignore user images and custom emojis'
              : 'See user images and custom emojis'}
          </MenuItem>

          <MenuItem
            className="text-start"
            faSrc={
              !muteUserManager.isEmbedMuted(userId) ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'
            }
            onClick={() => {
              afterOptionSelect();
              if (muteUserManager.isEmbedMuted(userId)) {
                muteUserManager.muteEmbed(userId, false);
              } else {
                muteUserManager.muteEmbed(userId, true);
              }
            }}
          >
            {!muteUserManager.isEmbedMuted(userId) ? 'Ignore user embeds' : 'See user embeds'}
          </MenuItem>

          <MenuBorder />

          <MenuItem
            className="text-start"
            faSrc={
              !muteUserManager.isReactionMuted(userId) ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'
            }
            onClick={() => {
              afterOptionSelect();
              if (muteUserManager.isReactionMuted(userId)) {
                muteUserManager.muteReaction(userId, false);
              } else {
                muteUserManager.muteReaction(userId, true);
              }
            }}
          >
            {!muteUserManager.isReactionMuted(userId)
              ? 'Ignore user reactions'
              : 'See user reactions'}
          </MenuItem>

          <MenuBorder />

          <MenuItem
            className="text-start"
            faSrc={
              !muteUserManager.isVideoMuted(userId) ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'
            }
            onClick={() => {
              afterOptionSelect();
              if (muteUserManager.isVideoMuted(userId)) {
                muteUserManager.muteVideo(userId, false);
              } else {
                muteUserManager.muteVideo(userId, true);
              }
            }}
          >
            {!muteUserManager.isVideoMuted(userId) ? 'Ignore user videos' : 'See user videos'}
          </MenuItem>
        </>
      ) : null}
    </div>
  );
}

UserOptions.defaultProps = {
  afterOptionSelect: null,
};

UserOptions.propTypes = {
  userId: PropTypes.string.isRequired,
  afterOptionSelect: PropTypes.func,
};

export default UserOptions;
