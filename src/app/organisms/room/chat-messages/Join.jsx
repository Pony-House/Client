import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function JoinMessage({ user }) {

    return (
        <>
            <strong>{twemojifyReact(user)}</strong>
            {' joined the room'}
        </>
    );

};