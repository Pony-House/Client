import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function LeaveMessage({ user, reason }) {

    const reasonMsg = (typeof reason === 'string') ? `: ${reason}` : '';

    return (
        <>
            <strong>{twemojifyReact(user)}</strong>
            {' left the room'}
            {twemojifyReact(reasonMsg)}
        </>
    );

};