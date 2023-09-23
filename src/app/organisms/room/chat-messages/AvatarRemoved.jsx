import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function AvatarRemovedMessage({ user }) {
    return (
        <>
            <strong>{twemojifyReact(user)}</strong>
            {' removed their avatar'}
        </>
    );
};