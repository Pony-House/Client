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
    return tinyCache.added.length > 0 ?
        <>
            <strong>{twemojifyReact(user)}</strong>
            {` pinned ${tinyCache.added.length === 1 ? 'a' : tinyCache.added.length} ${tinyCache.added.length === 1 ? 'message' : 'messages'} to this channel. See all pinned messages.`}
        </> : tinyCache.removed.length > 0 ?
            <>
                <strong>{twemojifyReact(user)}</strong>
                {` unpinned ${tinyCache.removed.length === 1 ? 'a' : tinyCache.removed.length} ${tinyCache.removed.length === 1 ? 'message' : 'messages'} to this channel. See all pinned messages.`}
            </> : null;

};