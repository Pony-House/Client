import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';
import { textValueToNumber } from '../../../../util/tools';
import appLoadMsg from '../../../../../mods/appLoadMsg';

export default function JoinMessage({ user, date }) {

    let textIndex = textValueToNumber(`${user}_${date}`, appLoadMsg.en.welcomeUser.length);
    if (textIndex > appLoadMsg.en.welcomeUser.length) {
        textIndex = appLoadMsg.en.welcomeUser.length - 1;
    } else if (textIndex < 0) {
        textIndex = 0;
    }

    const msg = appLoadMsg.en.welcomeUser[textIndex].split('[!!{username}!!](usernameOnClick)');
    if (msg.length === 2) {
        return <>{`${msg[0]} `}<strong>{twemojifyReact(user)}</strong>{` ${msg[1]}`}</>;
    }

    return <><strong>{twemojifyReact(user)}</strong>
        {' joined the room'}
    </>;

};