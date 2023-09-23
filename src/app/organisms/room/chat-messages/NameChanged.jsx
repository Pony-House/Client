import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function NameChangedMessage({ user, newName }) {
    return (
        <>
            <strong>{twemojifyReact(user)}</strong>
            {' changed their display name to '}
            <strong>{twemojifyReact(newName)}</strong>
        </>
    );
};