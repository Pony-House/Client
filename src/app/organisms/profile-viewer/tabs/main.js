import moment, { momentFormat } from '@src/util/libs/momentjs';
import { readImageUrl } from '@src/util/libs/mediaCache';
import { twemojify } from '../../../../util/twemojify';
import { copyToClipboard } from '../../../../util/common';
import { toast } from '../../../../util/tools';

const timezoneAutoUpdate = { text: null, html: null, value: null };
setInterval(() => {
  if (timezoneAutoUpdate.html && timezoneAutoUpdate.value) {
    let timezoneText = 'null';
    try {
      timezoneText = moment()
        .tz(timezoneAutoUpdate.value)
        .format(`MMMM Do YYYY, ${momentFormat.clock()}`);
    } catch {
      timezoneText = 'ERROR!';
    }

    timezoneAutoUpdate.text = timezoneText;
    timezoneAutoUpdate.html.text(timezoneText);
  }
}, 60000);

const dNoneChange = (ref, enabled) => {
  if (enabled || ref.hasClass('no-show')) {
    ref.addClass('d-none');
  } else {
    ref.removeClass('d-none');
  }
};

export default function renderAbout(
  userPronounsRef,
  ethereumValid,
  displayNameRef,
  customStatusRef,
  profileBanner,
  bioRef,
  timezoneRef,
  content,
) {
  // Ethereum
  if (ethereumValid) {
    const displayName = $(displayNameRef.current);
    let ethereumIcon = displayName.find('#ethereum-icon');
    if (ethereumIcon.length < 1) {
      ethereumIcon = $('<span>', {
        id: 'ethereum-icon',
        class: 'ms-2',
        title: content.presenceStatusMsg.ethereum.address,
      }).append($('<i>', { class: 'fa-brands fa-ethereum' }));

      ethereumIcon
        .on('click', () => {
          try {
            copyToClipboard(content.presenceStatusMsg.ethereum.address);
            toast('Ethereum address successfully copied to the clipboard.');
          } catch (err) {
            console.error(err);
            alert(err.message);
          }
        })
        .tooltip();

      displayName.append(ethereumIcon);
    }
  }

  // Get Banner Data
  const bannerDOM = $(profileBanner.current);

  if (bannerDOM.length > 0) {
    if (
      typeof content.presenceStatusMsg.banner === 'string' &&
      content.presenceStatusMsg.banner.length > 0
    ) {
      bannerDOM
        .css('background-image', `url("${content.presenceStatusMsg.banner}")`)
        .addClass('exist-banner');
    } else {
      bannerDOM.css('background-image', '').removeClass('exist-banner');
    }
  }

  // Get Bio Data
  if (bioRef.current) {
    const bioDOM = $(bioRef.current);
    const tinyBio = $('#tiny-bio');

    if (tinyBio.length > 0) {
      dNoneChange(bioDOM, false);
      if (
        typeof content.presenceStatusMsg.bio === 'string' &&
        content.presenceStatusMsg.bio.length > 0
      ) {
        tinyBio.html(
          twemojify(content.presenceStatusMsg.bio.substring(0, 190), undefined, true, false),
        );
      } else {
        dNoneChange(bioDOM, true);
        tinyBio.html('');
      }
    } else {
      dNoneChange(bioDOM, true);
    }
  }

  // Get Timezone Data
  if (timezoneRef.current) {
    const timezoneDOM = $(timezoneRef.current);
    const tinyTimezone = $('#tiny-timezone');

    if (tinyTimezone.length > 0) {
      dNoneChange(timezoneDOM, false);
      if (
        typeof content.presenceStatusMsg.timezone === 'string' &&
        content.presenceStatusMsg.timezone.length > 0
      ) {
        let timezoneText = 'null';
        try {
          timezoneText = moment()
            .tz(content.presenceStatusMsg.timezone)
            .format(`MMMM Do YYYY, ${momentFormat.clock()}`);
        } catch {
          timezoneText = 'ERROR!';
          dNoneChange(timezoneDOM, true);
        }

        if (timezoneAutoUpdate.html) delete timezoneAutoUpdate.html;

        timezoneAutoUpdate.html = tinyTimezone;
        timezoneAutoUpdate.value = content.presenceStatusMsg.timezone;
        timezoneAutoUpdate.text = timezoneText;

        tinyTimezone.text(timezoneText);
      } else {
        dNoneChange(timezoneDOM, true);
        tinyTimezone.html('');
      }
    } else {
      dNoneChange(timezoneDOM, true);
    }
  }

  // Get Pronouns Data
  if (userPronounsRef.current && content && content.presenceStatusMsg) {
    const pronounsDOM = $(userPronounsRef.current);

    // Message Icon
    if (
      typeof content.presenceStatusMsg.pronouns === 'string' &&
      content.presenceStatusMsg.pronouns.length > 0
    ) {
      pronounsDOM.removeClass('d-none').text(content.presenceStatusMsg.pronouns);
    } else {
      pronounsDOM.empty().addClass('d-none');
    }
  }

  // Get Custom Status Data
  const customStatusDOM = $(customStatusRef.current);
  customStatusDOM
    .removeClass('d-none')
    .removeClass('custom-status-emoji-only')
    .addClass('emoji-size-fix');
  const htmlStatus = [];
  let isAloneEmojiCustomStatus = false;

  if (
    content &&
    content.presenceStatusMsg &&
    content.presence !== 'offline' &&
    content.presence !== 'unavailable' &&
    ((typeof content.presenceStatusMsg.msg === 'string' &&
      content.presenceStatusMsg.msg.length > 0) ||
      (typeof content.presenceStatusMsg.msgIcon === 'string' &&
        content.presenceStatusMsg.msgIcon.length > 0))
  ) {
    if (
      typeof content.presenceStatusMsg.msgIcon === 'string' &&
      content.presenceStatusMsg.msgIcon.length > 0
    ) {
      htmlStatus.push(
        $('<img>', {
          src: readImageUrl(content.presenceStatusMsg.msgIcon),
          alt: 'icon',
          class: 'emoji me-1',
        }),
      );
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
    } else {
      isAloneEmojiCustomStatus = true;
    }
  } else {
    customStatusDOM.addClass('d-none');
  }

  customStatusDOM.html(htmlStatus);
  if (isAloneEmojiCustomStatus) {
    customStatusDOM.addClass('custom-status-emoji-only').removeClass('emoji-size-fix');
  }
}
