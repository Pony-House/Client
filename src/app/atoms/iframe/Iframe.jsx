import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { objType } from 'for-promise/utils/lib.mjs';

export const postMessage = (current, msg = null) => current.contentWindow.postMessage(msg);

const Iframe = React.forwardRef(
  (
    {
      title = null,
      id = null,
      src = null,
      alt = null,
      className = null,
      allowFullScreen = null,
      onMessage = null,
      name = null,
      align = null,
      height = null,
      sandbox = null,
      width = null,
      seamless = null,
      style = null,
      frameBorder = null,
    },
    ref,
  ) => {
    const iframeRef = ref || useRef(null);
    const url = new URL(src || '');

    useEffect(() => {
      if (iframeRef.current && onMessage) {
        const msgFilter = (event) => {
          if (event.origin === url.origin) {
            let data;
            if (typeof event.data === 'string') {
              try {
                data = JSON.parse(event.data);
              } catch {
                data = event.data;
              }
            } else data = event.data;

            onMessage(event, data);
          }
        };
        window.addEventListener('message', msgFilter, false);
        return () => {
          window.removeEventListener('message', msgFilter, false);
        };
      }
    });

    return (
      <iframe
        title={title}
        style={style}
        id={id}
        src={src}
        alt={alt}
        ref={iframeRef}
        className={className || 'w-100'}
        allowFullScreen={allowFullScreen}
        name={name}
        align={align}
        height={height}
        sandbox={sandbox}
        width={width}
        seamless={seamless}
        frameBorder={typeof frameBorder !== 'undefined' ? String(frameBorder) : null}
        webkitallowfullscreen={
          typeof allowFullScreen !== 'undefined' ? String(allowFullScreen) : null
        }
        mozallowfullscreen={typeof allowFullScreen !== 'undefined' ? String(allowFullScreen) : null}
      />
    );
  },
);

Iframe.propTypes = {
  style: PropTypes.object,
  allowFullScreen: PropTypes.bool,
  name: PropTypes.string,
  align: PropTypes.string,
  sandbox: PropTypes.string,
  seamless: PropTypes.bool,
  height: PropTypes.number,
  width: PropTypes.number,
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  onMessage: PropTypes.func,
  frameBorder: PropTypes.number,
};

export default Iframe;
