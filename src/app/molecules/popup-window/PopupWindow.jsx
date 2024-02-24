import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';

import mobileEvents from '@src/util/libs/mobile';

import { twemojifyReact } from '../../../util/twemojify';

import Text from '../../atoms/text/Text';
import { MenuItem } from '../../atoms/context-menu/ContextMenu';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

function PWContentSelector({ selected, variant, iconSrc, type, onClick, children }) {
  const pwcsClass = selected ? ' pw-content-selector--selected' : '';
  return (
    <div className={`pw-content-selector${pwcsClass}`}>
      <MenuItem variant={variant} iconSrc={iconSrc} type={type} onClick={onClick}>
        {children}
      </MenuItem>
    </div>
  );
}

PWContentSelector.defaultProps = {
  selected: false,
  variant: 'link btn-bg',
  iconSrc: 'none',
  type: 'button',
};

PWContentSelector.propTypes = {
  selected: PropTypes.bool,
  variant: PropTypes.oneOf(bsColorsArray),
  iconSrc: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit']),
  onClick: PropTypes.func.isRequired,
  children: PropTypes.string.isRequired,
};

function PopupWindow({
  className,
  isOpen,
  title,
  contentTitle,
  drawer,
  onAfterClose,
  onRequestClose,
  children,
  classBody,
  size,
  id,
}) {
  const haveDrawer = drawer !== null;
  const cTitle = contentTitle !== null ? contentTitle : title;

  let finalTitle;

  if (typeof title !== 'undefined') {
    finalTitle = typeof title === 'string' ? twemojifyReact(title) : title;
  } else if (typeof cTitle !== 'undefined') {
    finalTitle =
      typeof cTitle === 'string' ? (
        <Text variant="h2" weight="medium" primary>
          {twemojifyReact(cTitle)}
        </Text>
      ) : (
        cTitle
      );
  }

  useEffect(() => {
    const closeByMobile = () => typeof onRequestClose === 'function' && onRequestClose();

    mobileEvents.on('backButton', closeByMobile);
    return () => {
      mobileEvents.off('backButton', closeByMobile);
    };
  });

  return (
    <Modal
      id={id}
      show={isOpen}
      onHide={onRequestClose}
      onExited={onAfterClose}
      dialogClassName={
        className === null
          ? `${size} modal-dialog-scrollable modal-popup`
          : `${className} ${size} modal-dialog-scrollable modal-popup`
      }
    >
      {finalTitle ? (
        <Modal.Header className="noselect" closeButton>
          <Modal.Title className="h5 emoji-size-fix">{finalTitle}</Modal.Title>
        </Modal.Header>
      ) : null}

      <Modal.Body className={`bg-bg2${classBody ? ` ${classBody}` : ''}`}>
        {haveDrawer && { drawer }}
        {children}
      </Modal.Body>
    </Modal>
  );
}

PopupWindow.defaultProps = {
  id: null,
  classBody: null,
  className: null,
  size: null,
  drawer: null,
  contentTitle: null,
  onAfterClose: null,
  onRequestClose: null,
};

PopupWindow.propTypes = {
  id: PropTypes.string,
  classBody: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.node,
  contentTitle: PropTypes.node,
  drawer: PropTypes.node,
  onAfterClose: PropTypes.func,
  onRequestClose: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export { PopupWindow as default, PWContentSelector };
