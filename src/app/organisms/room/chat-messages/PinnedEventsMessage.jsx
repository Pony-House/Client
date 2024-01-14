import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';
import { objType } from '../../../../util/tools';
import { openPinMessageModal } from '../../../../util/libs/pinMessage';

export function comparePinEvents(content, prevContent) {

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

    return tinyCache;

};

export default function PinnedEventsMessage({ user, comparedPinMessages, room }) {

    // Items
    const { removed, added } = comparedPinMessages;

    const openPinMessages = (evt) => {
        evt.preventDefault();
        openPinMessageModal(room);
    };

    // Result
    return added.length > 0 ?
        <>
            <strong>{twemojifyReact(user)}</strong>
            {` pinned ${added.length === 1 ? 'a' : added.length} ${added.length === 1 ? 'message' : 'messages'} to this channel. See all `}<a href='#' onClick={openPinMessages}>pinned messages</a>.
        </> : removed.length > 0 ?
            <>
                <strong>{twemojifyReact(user)}</strong>
                {` unpinned ${removed.length === 1 ? 'a' : removed.length} ${removed.length === 1 ? 'message' : 'messages'} to this channel. See all `}<a href='#' onClick={openPinMessages}>pinned messages</a>.
            </> : null;

};