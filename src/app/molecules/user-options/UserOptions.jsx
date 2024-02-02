import React from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';
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

          const oldNickname = getDataList('user_cache', 'friend_nickname', userId);
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

          if (typeof nickname === 'string')
            addToDataFolder('user_cache', 'friend_nickname', userId, nickname);
        }}
      >
        Change Friend Nickname
      </MenuItem>

      {userId !== mx.getUserId() ? (
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
          {!isWhitelist ? 'Add Invite Whitelist' : 'Remove Invite Whitelist'}
        </MenuItem>
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
