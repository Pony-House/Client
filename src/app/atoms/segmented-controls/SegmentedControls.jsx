import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './SegmentedControls.scss';

import Text from '../text/Text';
import RawIcon from '../system-icons/RawIcon';

function SegmentedControls({
  selected, segments, onSelect, className
}) {
  const [select, setSelect] = useState(selected);

  function selectSegment(segmentIndex) {
    setSelect(segmentIndex);
    onSelect(segmentIndex);
  }

  useEffect(() => {
    setSelect(selected);
  }, [selected]);

  return (
    <div className={`btn-group noselect ${className}`} role="group">
      {
        segments.map((segment, index) => (
          <button
            key={Math.random().toString(20).substring(2, 6)}
            className={`btn btn-theme ${select === index ? ' active' : ''}`}
            type="button"
            onClick={() => selectSegment(index)}
          >
            {segment.iconSrc && <RawIcon size="small" src={segment.iconSrc} />}
            {segment.text && <Text variant="b2">{segment.text}</Text>}
          </button>
        ))
      }
    </div>
  );
}

SegmentedControls.propTypes = {
  className: PropTypes.string,
  selected: PropTypes.number.isRequired,
  segments: PropTypes.arrayOf(PropTypes.shape({
    iconSrc: PropTypes.string,
    text: PropTypes.string,
  })).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default SegmentedControls;
