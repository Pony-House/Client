/* eslint-disable import/prefer-default-export */
import React, { lazy, Suspense } from 'react';

import * as linkify from "linkifyjs";
import linkifyHtml from 'linkify-html';
import linkifyRegisterKeywords from 'linkify-plugin-keyword';

import parse from 'html-react-parser';
import twemoji from 'twemoji';
import { sanitizeText } from './sanitize';

import keywords from '../../mods/keywords';

// Register Protocols
linkify.registerCustomProtocol('matrix');
linkify.registerCustomProtocol('twitter');
linkify.registerCustomProtocol('steam');

linkify.registerCustomProtocol('ircs');
linkify.registerCustomProtocol('irc');

linkify.registerCustomProtocol('ftp');

linkify.registerCustomProtocol('ipfs');

linkify.registerCustomProtocol('bitcoin');
linkify.registerCustomProtocol('dogecoin');
linkify.registerCustomProtocol('monero');

linkify.registerCustomProtocol('ethereum');
linkify.registerCustomProtocol('web3');

linkify.registerCustomProtocol('ar');
linkify.registerCustomProtocol('lbry');

// Register Keywords
const tinywords = [];
for (const item in keywords) { tinywords.push(keywords[item].name); }
linkifyRegisterKeywords(tinywords);

// Emoji Base
export const TWEMOJI_BASE_URL = './img/twemoji/';

// String Protocols
global.String.prototype.toUnicode = function () {
  let result = "";
  for (let i = 0; i < this.length; i++) {
    // Assumption: all characters are < 0xffff
    result += `\\u${(`000${this[i].charCodeAt(0).toString(16)}`).substring(-4)}`;
  }
  return result;
};

global.String.prototype.emojiToCode = function () {
  return this.codePointAt(0).toString(16);
};

// Tiny Math
const Math = lazy(() => import('../app/atoms/math/Math'));
const mathOptions = {
  replace: (node) => {
    const maths = node.attribs?.['data-mx-maths'];
    if (maths) {
      return (
        <Suspense fallback={<code>{maths}</code>}>
          <Math
            content={maths}
            throwOnError={false}
            errorColor="var(--tc-danger-normal)"
            displayMode={node.name === 'div'}
          />
        </Suspense>
      );
    }
    return null;
  },
};

/**
 * @param {string} text - text to twemojify
 * @param {object|undefined} opts - options for tweomoji.parse
 * @param {boolean} [linkify=false] - convert links to html tags (default: false)
 * @param {boolean} [sanitize=true] - sanitize html text (default: true)
 * @param {boolean} [maths=false] - render maths (default: false)
 * @returns React component
 */
export function twemojify(text, opts, linkifyEnabled = false, sanitize = true, maths = false) {

  if (typeof text !== 'string') return text;

  let content = text;
  const options = opts ?? { base: TWEMOJI_BASE_URL };
  if (!options.base) {
    options.base = TWEMOJI_BASE_URL;
  }

  if (sanitize) {
    content = sanitizeText(content);
  }

  content = twemoji.parse(content, options);
  if (linkifyEnabled) {
    content = linkifyHtml(content, {

      defaultProtocol: 'https',

      formatHref: {
        keyword: (keyword) => {
          const tinyword = keyword.toLowerCase();
          const item = keywords.find(word => word.name === tinyword);
          if (item) return item.href;
        },
      },

      rel: 'noreferrer noopener',

      render: ({ tagName, attributes }) => {

        let tinyAttrs = '';
        for (const attr in attributes) {
          tinyAttrs += ` ${attr}=${attributes[attr]}`;
        }

        return `<${tagName} class='linkify-url' target='_blank'${tinyAttrs}>${arguments[0]}</${tagName}>`;

      },

    });
  }

  return parse(content, maths ? mathOptions : null);

}

export function twemojifyIcon(text, size = 72) {
  return `${TWEMOJI_BASE_URL}${size}x${size}/${text.emojiToCode().toLowerCase()}.png`;
}
