import React from 'react';

import $ from 'jquery';

import tinyFixScrollChat from '@src/app/molecules/media/mediaFix';
import Iframe from '@src/app/atoms/iframe/Iframe';

// Image fix
const IFRAME = {
  jquery: function () {
    // const el = $(this);
  },
  React: ({ attribs }) =>
    (attribs && typeof attribs.src === 'string') ||
    attribs.src === null ||
    typeof attribs.src === 'undefined' ? (
      <Iframe
        onLoad={() => tinyFixScrollChat()}
        allowFullScreen
        title={attribs.title}
        id={attribs.id}
        name={attribs.name}
        align={attribs.align}
        height={attribs.height}
        sandbox={attribs.sandbox}
        width={attribs.width}
        seamless={attribs.seamless}
        style={attribs.style}
        frameBorder={false}
        className={attribs.class}
        src={attribs.src}
        alt={attribs.alt}
      />
    ) : (
      <span />
    ),
};

export default IFRAME;
