import React from 'react';
import PropTypes from 'prop-types';

import { objType } from 'for-promise/utils/lib.mjs';
import { twemojifyReact } from '@src/util/twemojify';
import Img from '@src/app/atoms/image/Image';

const UserCustomStatus = React.forwardRef(
  (
    {
      animParentsCount = 0,
      presenceData = null,
      className = null,
      forceShow = false,
      emojiFix = 'emoji-size-fix',
      useHoverAnim = false,
      disableEmojiOnly = false,
      altContent = null,
    },
    ref,
  ) => {
    const existPresenceObject = presenceData && objType(presenceData.presenceStatusMsg, 'object');
    const presenceIsPureText =
      presenceData &&
      typeof presenceData.presenceStatusMsg === 'string' &&
      presenceData.presenceStatusMsg.length > 0;

    const existMsgPresence =
      existPresenceObject &&
      typeof presenceData.presenceStatusMsg.msg === 'string' &&
      presenceData.presenceStatusMsg.msg.length > 0;

    const existIconPresence =
      existPresenceObject &&
      typeof presenceData.presenceStatusMsg.msgIcon === 'string' &&
      presenceData.presenceStatusMsg.msgIcon.length > 0;

    const canShowPresence =
      forceShow ||
      ((existPresenceObject || presenceIsPureText) &&
        presenceData.presence !== 'offline' &&
        presenceData.presence !== 'invisible' &&
        presenceData.presence !== 'unavailable');

    const tinyClass = `${existMsgPresence ? `${emojiFix} ` : ''}user-custom-status${!existMsgPresence && !disableEmojiOnly ? ' custom-status-emoji-only' : ''}${className ? ` ${className}` : ''}`;

    if (canShowPresence && (existIconPresence || existMsgPresence || presenceIsPureText))
      return (
        <div ref={ref} className={tinyClass}>
          {existIconPresence ? (
            <Img
              queueId="emoji"
              animParentsCount={animParentsCount}
              className="emoji me-1"
              alt="icon"
              src={
                useHoverAnim
                  ? presenceData.presenceStatusMsg.msgIconThumb
                  : presenceData.presenceStatusMsg.msgIcon
              }
              animSrc={useHoverAnim ? presenceData.presenceStatusMsg.msgIcon : null}
            />
          ) : null}
          {existMsgPresence ? (
            <span className="text-truncate cs-text">
              {twemojifyReact(
                !presenceIsPureText
                  ? presenceData.presenceStatusMsg.msg.substring(0, 100)
                  : presenceData.presenceStatusMsg.substring(0, 100),
              )}
            </span>
          ) : null}
        </div>
      );

    return !altContent ? null : (
      <div ref={ref} className={tinyClass}>
        <span className="text-truncate cs-text">{altContent}</span>
      </div>
    );
  },
);

UserCustomStatus.propTypes = {
  animParentsCount: PropTypes.number,
  emojiFix: PropTypes.string,
  className: PropTypes.string,
  presenceData: PropTypes.object,
  useHoverAnim: PropTypes.bool,
  disableEmojiOnly: PropTypes.bool,
  altContent: PropTypes.node,
  forceShow: PropTypes.bool,
};

export default UserCustomStatus;
