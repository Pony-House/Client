import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function NameRemovedMessage({ user, lastName }) {
    return (
        <>
            <strong>{twemojifyReact(user)}</strong>
            {' removed their display name '}
            <strong>{twemojifyReact(lastName)}</strong>
        </>
    );
};