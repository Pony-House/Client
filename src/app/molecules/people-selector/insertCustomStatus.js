import $ from 'jquery';
import { ImgJquery } from '@src/app/atoms/image/Image';
import { twemojify } from '../../../util/twemojify';

export default function insertCustomStatus(customStatusRef, content, testMode = false) {
  // Custom Status
  if (customStatusRef && customStatusRef.current) {
    // Get Status
    const customStatus = $(customStatusRef.current);
    const htmlStatus = [];
    let customStatusImg;

    if (
      content &&
      content.presenceStatusMsg &&
      ((content.presence !== 'offline' && content.presence !== 'unavailable') || testMode) &&
      ((typeof content.presenceStatusMsg.msg === 'string' &&
        content.presenceStatusMsg.msg.length > 0) ||
        (typeof content.presenceStatusMsg.msgIcon === 'string' &&
          content.presenceStatusMsg.msgIcon.length > 0))
    ) {
      if (
        typeof content.presenceStatusMsg.msgIcon === 'string' &&
        content.presenceStatusMsg.msgIcon.length > 0
      ) {
        customStatusImg = ImgJquery({
          animParentsCount: 3,
          src: content.presenceStatusMsg.msgIconThumb,
          animSrc: content.presenceStatusMsg.msgIcon,
          alt: 'icon',
          className: 'emoji me-1',
        });
        htmlStatus.push(customStatusImg);
      }

      if (
        typeof content.presenceStatusMsg.msg === 'string' &&
        content.presenceStatusMsg.msg.length > 0
      ) {
        htmlStatus.push(
          $('<span>', { class: 'text-truncate cs-text' }).html(
            twemojify(content.presenceStatusMsg.msg.substring(0, 100)),
          ),
        );
      }
    }

    customStatus.html(htmlStatus);
  }
}
