import React from 'react';
import HighlightCode from '@src/app/organisms/view-source/HighlightCode';
import tinyFixScrollChat from '@src/app/molecules/media/mediaFix';

// Image fix
const PRE = {
  React: ({ children }) => {
    if (
      Array.isArray(children) &&
      children.length === 1 &&
      Array.isArray(children[0].children) &&
      children[0].children.length > 0
    ) {
      let code = '';
      for (const item in children[0].children) {
        if (
          children[0].children[item].type === 'text' &&
          typeof children[0].children[item].data === 'string'
        ) {
          code += children[0].children[item].data;
        } else if (
          children[0].children[item].type === 'tag' &&
          children[0].children[item].name === 'img' &&
          children[0].children[item].attribs &&
          typeof children[0].children[item].attribs.alt === 'string'
        ) {
          code += children[0].children[item].attribs.alt;
        }
      }

      return (
        <HighlightCode
          code={code}
          className="hljs-fix chatbox-size-fix"
          onLoad={() => tinyFixScrollChat()}
        />
      );
    }
    return null;
  },
};

export default PRE;
