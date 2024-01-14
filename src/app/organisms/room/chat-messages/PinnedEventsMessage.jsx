import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';
import { objType } from '../../../../util/tools';

export default function PinnedEventsMessage({ user, content, prevContent }) {

    const tinyCache = { added: [], removed: [] };
    if (objType(content, 'object') && Array.isArray(content.pinned)) {

        console.log(content, prevContent);

    }

    console.log(tinyCache);
    return <>
        <strong>{twemojifyReact(user)}</strong>
        {` pinned a message to this channel. See all pinned messages.`}
    </>;

};