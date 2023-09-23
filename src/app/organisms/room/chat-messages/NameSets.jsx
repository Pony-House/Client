import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function NameSetsMessage({ user, newName }) {
    return (
        <>
            <strong>{twemojifyReact(user)}</strong>
            {' set display name to '}
            <strong>{twemojifyReact(newName)}</strong>
        </>
    );
};