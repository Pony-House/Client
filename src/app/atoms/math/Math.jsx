import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import katex from 'katex';

import 'katex/dist/contrib/copy-tex';

const Math = React.memo(
  ({ content, throwOnError = null, errorColor = null, displayMode = null }) => {
    const ref = useRef(null);

    useEffect(() => {
      katex.render(content, ref.current, { throwOnError, errorColor, displayMode });
    }, [content, throwOnError, errorColor, displayMode]);

    return <span ref={ref} />;
  },
);

Math.propTypes = {
  content: PropTypes.string.isRequired,
  throwOnError: PropTypes.bool,
  errorColor: PropTypes.string,
  displayMode: PropTypes.bool,
};

export default Math;
