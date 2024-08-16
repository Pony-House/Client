import React from 'react';

import $ from 'jquery';
import Timestamps from './Timestamps';

const reactTags = { timestamp: Timestamps.React };
const jQueryTags = { timestamp: Timestamps.jquery };

// Image fix
const SPAN = {
  jquery: function () {
    let complete = false;
    const tinyThis = this;
    const tinyArgs = arguments;
    $(tinyThis).each(function () {
      if (!complete) {
        $.each(this.attributes, function () {
          if (!complete) {
            // this.attributes is not a plain object, but an array
            // of attribute nodes, which contain both the name and value
            if (this.specified) {
              // this.value this.name
              const attrParts = this.name.split('-');
              if (
                attrParts[0] === 'data' &&
                attrParts[1] === 'mx' &&
                typeof reactTags[attrParts[2]] === 'function'
              ) {
                reactTags[attrParts[2]].apply(tinyThis, tinyArgs);
                complete = true;
              }
            }
          }
        });
      }
    });
  },
  React: (node) => {
    for (const item in node.attribs) {
      const attrParts = item.split('-');
      if (
        attrParts[0] === 'data' &&
        attrParts[1] === 'mx' &&
        typeof reactTags[attrParts[2]] === 'function'
      ) {
        return reactTags[attrParts[2]](node);
      }
    }
    return null;
  },
};

export default SPAN;
