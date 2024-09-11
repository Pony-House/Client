import React from 'react';

import $ from 'jquery';

import tinyFixScrollChat from '@src/app/molecules/media/mediaFix';
import Img, { ImgJquery } from '@src/app/atoms/image/Image';

// Image fix
const IMG = {
  jquery: function () {
    const el = $(this);
    const dataMxEmoticon = el.attr('data-mx-emoticon') || el.prop('data-mx-emoticon');
    const className = el.attr('class');
    const src = el.attr('src');
    const alt = el.attr('alt');

    el.replaceWith(
      ImgJquery({
        queueId: 'media',
        isEmoji: typeof dataMxEmoticon !== 'undefined' && dataMxEmoticon !== null,
        onLoad: () => tinyFixScrollChat(),
        onLoadingChange: () => tinyFixScrollChat(),
        dataMxEmoticon,
        className,
        src,
        alt,
      }),
    );
  },
  React: ({ attribs }) => {
    const imgResult =
      attribs &&
      typeof attribs.src === 'string' &&
      (attribs.src.startsWith('mxc://') || attribs.src.startsWith('./')) ? (
        <Img
          queueId="media"
          isEmoji={
            typeof attribs['data-mx-emoticon'] !== 'undefined' &&
            attribs['data-mx-emoticon'] !== null
          }
          onLoad={() => tinyFixScrollChat()}
          onLoadingChange={() => tinyFixScrollChat()}
          placement="top"
          content={<div className="small">{attribs.alt}</div>}
          dataMxEmoticon={attribs['data-mx-emoticon']}
          className={attribs.class}
          src={attribs.src}
          alt={attribs.alt}
        />
      ) : (
        <span />
      );

    // Emoji data
    /* if (
                          attribs['data-mx-emoticon'] ||
                          (typeof attribs.class === 'string' && attribs.class.includes('emoji'))
                        ) {
                          return 
                        } */

    return imgResult;
  },
};

export default IMG;
