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
            <MenuHeader>{twemojifyReact(`User Options for ${user?.userId}`)}</MenuHeader>
            <MenuItem className="text-start" faSrc="fa-solid fa-user-pen" onClick={async () => {

                afterOptionSelect();
                const nickname = await tinyPrompt(`This information will only be visible to you. The new username will be visible after updating the page you are currently viewing.\n\nPlease type the user ${user?.userId} nickname here:`, 'Friend Nickname', {
                    placeholder: user?.userId,
                    maxlength: 25
                }, {
                    key: (e) => {

                        const input = $(e.target);
                        const value = input.val();

                        if (value.length > 25) input.val(value.substring(0, 25));

                    }
                });



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
