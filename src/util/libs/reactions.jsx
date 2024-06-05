import React from 'react';

import initMatrix from '@src/client/initMatrix';
import muteUserManager from './muteUserManager';
import { twemojify, twemojifyReact } from '../twemojify';
import { readImageUrl } from './mediaCache';

export const getCustomEmojiUrl = (reaction) => {
  let customEmojiUrl = null;
  if (reaction.match(/^mxc:\/\/\S+$/)) {
    customEmojiUrl = initMatrix.matrixClient.mxcUrlToHttp(reaction);
  }
  return customEmojiUrl;
};

export const getEventReactions = (eventReactions, ignoreMute = true, rLimit = null) => {
  const mx = initMatrix.matrixClient;
  const reactions = {};

  const addReaction = (key, shortcode, count, senderId, isActive, index) => {
    let isNewReaction = false;
    let reaction = reactions[key];
    if (reaction === undefined) {
      reaction = {
        index,
        count: 0,
        users: [],
        isActive: false,
      };
      isNewReaction = true;
    }

    if (shortcode) reaction.shortcode = shortcode;
    if (count) {
      reaction.count = count;
    } else {
      reaction.users.push(senderId);
      reaction.count = reaction.users.length;
      if (isActive) reaction.isActive = isActive;
    }

    reactions[key] = reaction;
    return isNewReaction;
  };

  if (eventReactions) {
    let tinyIndex = 0;
    eventReactions.forEach((rEvent) => {
      if (rEvent.getRelation() === null) return;

      const reaction = rEvent.getRelation();
      const senderId = rEvent.getSender();
      const { shortcode } = rEvent.getContent();
      const isActive = senderId === mx.getUserId();

      if (
        (ignoreMute || !muteUserManager.isReactionMuted(senderId)) &&
        addReaction(reaction.key, shortcode, undefined, senderId, isActive, tinyIndex)
      ) {
        tinyIndex++;
      }
    });
  } else {
    // Use aggregated reactions
    const aggregatedReaction = mEvent.getServerAggregatedRelation('m.annotation')?.chunk;
    if (!aggregatedReaction) return null;

    aggregatedReaction.forEach((reaction) => {
      if (reaction.type !== 'm.reaction') return;
      addReaction(reaction.key, undefined, reaction.count, undefined, false);
    });
  }

  let reacts = Object.keys(reactions).sort((a, b) => reactions[a].index - reactions[b].index);
  if (typeof rLimit === 'number') reacts = reacts.slice(0, rLimit);

  return { order: reacts, data: reactions };
};

export const ReactionImgReact = ({ reaction, shortcode, customEmojiUrl }) => {
  return customEmojiUrl ? (
    <img
      className="react-emoji"
      draggable="false"
      alt={shortcode ?? reaction}
      src={readImageUrl(customEmojiUrl)}
    />
  ) : (
    twemojifyReact(reaction, { className: 'react-emoji' })
  );
};

export const reactionImgjQuery = (reaction, shortcode, customEmojiUrl) => {
  return customEmojiUrl
    ? $('<img>', {
        class: 'react-emoji',
        draggable: 'false',
        alt: shortcode ?? reaction,
        src: readImageUrl(customEmojiUrl),
      })
    : twemojify(reaction, { className: 'react-emoji' });
};
