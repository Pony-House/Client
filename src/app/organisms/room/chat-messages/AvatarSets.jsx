import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function AvatarSetsMessage({ user }) {
    return (
        <>
            <strong>{twemojifyReact(user)}</strong>
            {' set a avatar'}
        </>
    );
};