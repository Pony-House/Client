import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function AvatarChangedMessage({ user }) {
    return (
        <>
            <strong>{twemojifyReact(user)}</strong>
            {' changed their avatar'}
        </>
    );
};