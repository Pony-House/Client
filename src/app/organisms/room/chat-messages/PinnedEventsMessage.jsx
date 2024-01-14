import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';
import { objType } from '../../../../util/tools';

export default function PinnedEventsMessage({ user, content, prevContent }) {

    // Preparing Validator
    const oldContent = objType(prevContent, 'object') && Array.isArray(prevContent.pinned) ? prevContent : { pinned: [] };
    const tinyCache = { added: [], removed: [] };
    if (objType(content, 'object') && Array.isArray(content.pinned)) {

        // Check Content
        for (const item in content.pinned) {
            if (typeof content.pinned[item] === 'string') {

                if (oldContent.pinned.indexOf(content.pinned[item]) < 0) {
                    tinyCache.added.push(content.pinned[item]);
                }

            }
        }

        // Old Content
        for (const item in oldContent.pinned) {
            if (typeof oldContent.pinned[item] === 'string') {

                if (content.pinned.indexOf(oldContent.pinned[item]) < 0) {
                    tinyCache.removed.push(oldContent.pinned[item]);
                }

            }
        }

    }

    // Result
    console.log(tinyCache);
    return <>
        <strong>{twemojifyReact(user)}</strong>
        {` pinned a message to this channel. See all pinned messages.`}
    </>;

};