import * as roomActions from '../../client/action/room';
import { MXID_REG } from '.';

const userCommands = {

    ignore: {
        category: 'default',
        sub_category: 'user',
        name: 'ignore',
        description: 'Ignore user. Example: /ignore userId1 userId2',
        exe: (roomId, data) => {
            const rawIds = data.split(' ');
            const userIds = rawIds.filter((id) => id.match(MXID_REG));
            if (userIds.length > 0) roomActions.ignore(userIds);
        },
    },

    unignore: {
        category: 'default',
        sub_category: 'user',
        name: 'unignore',
        description: 'Unignore user. Example: /unignore userId1 userId2',
        exe: (roomId, data) => {
            const rawIds = data.split(' ');
            const userIds = rawIds.filter((id) => id.match(MXID_REG));
            if (userIds.length > 0) roomActions.unignore(userIds);
        },
    },

};

export default userCommands;