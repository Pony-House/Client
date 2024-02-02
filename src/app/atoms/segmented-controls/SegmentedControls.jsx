import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import RawIcon from '../system-icons/RawIcon';

function SegmentedControls({ selected, segments, onSelect, onEmpty, className, type, iconSrc }) {
  const [select, setSelect] = useState(selected);

  function selectSegment(segmentIndex) {
    setSelect(segmentIndex);
    onSelect(segmentIndex);
  }

  useEffect(() => {
    setSelect(selected);
  }, [selected]);

  return type === 'buttons' ? (
    <div className={`btn-group noselect ${className}`} role="group">
      {segments.map((segment, index) => (
        <button
          key={Math.random().toString(20).substring(2, 6)}
          className={`btn btn-theme ${select === index ? ' active' : ''}`}
          type="button"
          onClick={() => selectSegment(index)}
        >
          {segment.iconSrc && <RawIcon size="small" src={segment.iconSrc} />}
          {segment.text && <small>{segment.text}</small>}
        </button>
      ))}
    </div>
  ) : type === 'select' ? (
    <select
      className="form-select form-control-bg"
      onChange={(event) => {
        const value = $(event.target).val();
        if (typeof value === 'string' && value.length > 0) {
          const index = Number(value);
          if (!Number.isNaN(index) && Number.isFinite(index) && index > -1) {
            selectSegment(index);
          } else if (typeof onEmpty === 'function') {
            onEmpty();
          }
        } else if (typeof onEmpty === 'function') {
          onEmpty();
        }
      }}
    >
      <option>
        {iconSrc && <RawIcon size="small" src={iconSrc} />}
        <small>Choose...</small>
      </option>

      {segments.map((segment, index) => (
        <option
          value={index}
          selected={select === index}
          key={Math.random().toString(20).substring(2, 6)}
        >
          {segment.iconSrc && <RawIcon size="small" src={segment.iconSrc} />}
          {segment.text && <small>{segment.text}</small>}
        </option>
      ))}
    </select>
  ) : null;
}

SegmentedControls.defaultProps = {
  type: 'buttons',
};

SegmentedControls.propTypes = {
  iconSrc: PropTypes.string,
  type: PropTypes.string,
  className: PropTypes.string,
  selected: PropTypes.number.isRequired,

  segments: PropTypes.arrayOf(
    PropTypes.shape({
      iconSrc: PropTypes.string,
      text: PropTypes.string,
    }),
  ).isRequired,

  onSelect: PropTypes.func.isRequired,
  onEmpty: PropTypes.func,
};

export default SegmentedControls;
