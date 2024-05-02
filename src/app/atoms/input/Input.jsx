import React from 'react';
import PropTypes from 'prop-types';

import TextareaAutosize from 'react-autosize-textarea';
import { isMobile } from '@src/util/libs/mobile';

function Input({
  id = null,
  label = '',
  name = '',
  value = '',
  placeholder = '',
  required = false,
  type = 'text',
  onChange = null,
  forwardRef = null,
  resizable = false,
  minHeight = 46,
  onResize = null,
  state = 'normal',
  onKeyDown = null,
  disabled = false,
  autoFocus = false,
  className = null,
}) {
  const isAutoFocus = !isMobile() ? autoFocus : false;
  return (
    <>
      {label !== '' && (
        <label className="small text-gray" htmlFor={id}>
          {label}
        </label>
      )}

      {resizable ? (
        <TextareaAutosize
          dir="auto"
          style={{ minHeight: `${minHeight}px` }}
          name={name}
          id={id}
          className={`form-control ${state !== 'normal' ? ` form-control-${state}` : 'form-control-bg'}${typeof className === 'string' ? ` ${className}` : ''}`}
          ref={forwardRef}
          type={type}
          placeholder={placeholder}
          required={required}
          defaultValue={value}
          autoComplete="off"
          onChange={onChange}
          onResize={onResize}
          onKeyDown={onKeyDown}
          disabled={disabled}
          autoFocus={isAutoFocus}
        />
      ) : (
        <input
          dir="auto"
          ref={forwardRef}
          id={id}
          name={name}
          className={`form-control ${state !== 'normal' ? ` form-control-${state}` : 'form-control-bg'}${typeof className === 'string' ? ` ${className}` : ''}`}
          type={type}
          placeholder={placeholder}
          required={required}
          defaultValue={value}
          autoComplete="off"
          onChange={onChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={isAutoFocus}
        />
      )}
    </>
  );
}

Input.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  type: PropTypes.string,
  onChange: PropTypes.func,
  forwardRef: PropTypes.shape({}),
  resizable: PropTypes.bool,
  minHeight: PropTypes.number,
  onResize: PropTypes.func,
  state: PropTypes.oneOf(['normal', 'success', 'error']),
  onKeyDown: PropTypes.func,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

export default Input;
