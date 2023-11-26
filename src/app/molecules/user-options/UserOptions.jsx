import React from 'react';
import PropTypes from 'prop-types';

import { twemojifyReact } from '../../../util/twemojify';

import initMatrix from '../../../client/initMatrix';
import { MenuHeader, MenuItem } from '../../atoms/context-menu/ContextMenu';
import { tinyPrompt } from '../../../util/tools';

function UserOptions({ userId, afterOptionSelect }) {

    const mx = initMatrix.matrixClient;
    const user = mx.getUser(userId);

    return (
        <div className="noselect emoji-size-fix w-100" style={{ maxWidth: '256px' }}>
            <MenuHeader>{twemojifyReact(`Options for ${user?.userId}`)}</MenuHeader>
            <MenuItem className="text-start" faSrc="fa-solid fa-user-pen" onClick={async () => {

                afterOptionSelect();
                const nickname = await tinyPrompt(`This information will only be visible to you. Please type the user ${user?.userId} nickname here:`, 'Friend Nickname', { placeholder: user?.userId });
                console.log(nickname);

            }} >Change Friend Nickname</MenuItem>
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
