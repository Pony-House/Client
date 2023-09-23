import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function UnbanMessage({ user, actor }) {
    return (
        <>
            <strong>{twemojifyReact(actor)}</strong>
            {' unbanned '}
            <strong>{twemojifyReact(user)}</strong>
        </>
    );
};