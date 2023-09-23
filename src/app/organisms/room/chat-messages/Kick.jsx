import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function KickMessage({ user, reason, actor }) {

    const reasonMsg = (typeof reason === 'string') ? `: ${reason}` : '';

    return (
        <>
            <strong>{twemojifyReact(actor)}</strong>
            {' kicked '}
            <strong>{twemojifyReact(user)}</strong>
            {twemojifyReact(reasonMsg)}
        </>
    );

};