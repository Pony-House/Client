import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';
import { textValueToNumber } from '../../../../util/tools';
import appLoadMsg from '../../../../../mods/appLoadMsg';

export default function LibMessages({ where, defaultMessage, user, date }) {

    let textIndex = textValueToNumber(`${user}_${date}`, appLoadMsg.en[where].length);
    if (textIndex > appLoadMsg.en[where].length) {
        textIndex = appLoadMsg.en[where].length - 1;
    } else if (textIndex < 0) {
        textIndex = 0;
    }

    const msg = appLoadMsg.en[where][textIndex].split('[!!{username}!!](usernameOnClick)');
    if (msg.length === 2) {
        return <>{msg[0]}<strong>{twemojifyReact(user)}</strong>{msg[1]}</>;
    }

    return defaultMessage;

};