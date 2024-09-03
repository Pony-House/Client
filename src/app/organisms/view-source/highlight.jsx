import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

import hljs from 'highlight.js';

// HL JS fixer
function hljsFixer(el, where, callback = function () {}) {
  if (where === 'MessageBody') {
    el.html(
      `<table class="table table-borderless align-middle m-0"><tbody><tr><td class="code-line noselect">1</td><td class="code-text">${el.html()}</tbody></table>`,
    );
    el.addClass('fixhl');
    let countBr = 1;

    el.html(
      el.html().replace(/(?:\r\n|\r|\n)/g, () => {
        countBr++;
        return `</td></tr><tr><td class="code-line noselect">${countBr}</td><td class="code-text">`;
      }),
    ).on('dblclick', () => {
      if (!el.hasClass('hljs-fullview')) {
        el.addClass('hljs-fullview');
      } else {
        el.removeClass('hljs-fullview');
      }
      callback();
    });
  }
}

const HighlightCode = React.forwardRef(
  (
    { code = null, lang = null, mode = 'MessageBody', className = null, space = 2, onLoad = null },
    ref,
  ) => {
    const codeRef = ref || useRef(null);
    const [enabled, setEnabled] = useState(false);
    useEffect(() => {
      if (codeRef.current) {
        if (!enabled) {
          hljs.highlightElement(codeRef.current);
          const el = $(codeRef.current);
          hljsFixer(el, mode);
          setEnabled(true);
        } else if (onLoad) onLoad(codeRef.current);
      }
    });

    return (
      <code
        ref={codeRef}
        className={`${lang ? `language-${lang}` : typeof code !== 'string' ? 'language-json' : ''}${className ? ` ${className}` : ''}`}
      >
        {typeof code !== 'string' ? JSON.stringify(code, null, space) : code}
      </code>
    );
  },
);

HighlightCode.propTypes = {
  onLoad: PropTypes.func,
  className: PropTypes.string,
  mode: PropTypes.string,
  lang: PropTypes.string,
  space: PropTypes.number,
  code: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array, PropTypes.node]),
};

export default HighlightCode;
