import initMatrix from '@src/client/initMatrix';
import { confirmDialog } from '../../molecules/confirm-dialog/ConfirmDialog';

export const handleBannerUpload = async (url, roomId) => {
  const mx = initMatrix.matrixClient;

  const spaceHeaderBody = $('.space-drawer-body');
  const spaceHeader = spaceHeaderBody.find('> .navbar');

  const bannerPlace = $('.space-banner .avatar__border');
  const bannerImg = $('.space-banner img');

  if (url === null) {
    const isConfirmed = await confirmDialog(
      'Remove space banner',
      'Are you sure that you want to remove room banner?',
      'Remove',
      'warning',
    );

    if (isConfirmed) {
      await mx.sendStateEvent(roomId, 'pony.house.settings', { url }, 'banner');

      spaceHeaderBody.removeClass('drawer-with-banner');
      spaceHeader.removeClass('banner-mode').css('background-image', '');

      bannerPlace.css('background-image', '').removeClass('banner-added');
      bannerImg.attr('src', '');
    }
  } else {
    await mx.sendStateEvent(roomId, 'pony.house.settings', { url }, 'banner');

    spaceHeaderBody.addClass('drawer-with-banner');
    spaceHeader
      .addClass('banner-mode')
      .css('background-image', `url("${mx.mxcUrlToHttp(url, 960, 540)}")`);

    bannerPlace
      .css('background-image', `url('${mx.mxcUrlToHttp(url, 400, 227)}')`)
      .addClass('banner-added');
    bannerImg.attr('src', mx.mxcUrlToHttp(url, 400, 227));
  }
};
