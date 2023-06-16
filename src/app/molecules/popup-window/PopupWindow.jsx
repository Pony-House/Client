import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal';

import { twemojify } from '../../../util/twemojify';

import Text from '../../atoms/text/Text';
import { MenuItem } from '../../atoms/context-menu/ContextMenu';
import ScrollView from '../../atoms/scroll/ScrollView';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

function PWContentSelector({
  selected, variant, iconSrc,
  type, onClick, children,
}) {
  const pwcsClass = selected ? ' pw-content-selector--selected' : '';
  return (
    <div className={`pw-content-selector${pwcsClass}`}>
      <MenuItem
        variant={variant}
        iconSrc={iconSrc}
        type={type}
        onClick={onClick}
      >
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
  className, isOpen, title, contentTitle,
  drawer, onAfterClose, onRequestClose, children,
  size
}) {
  const haveDrawer = drawer !== null;
  const cTitle = contentTitle !== null ? contentTitle : title;

  let finalTitle;

  if (typeof title !== 'undefined') {
    finalTitle = (
      typeof title === 'string'
        ? twemojify(title)
        : title
    );
  }

  else if (typeof cTitle !== 'undefined') {
    finalTitle =
      typeof cTitle === 'string'
        ? <Text variant="h2" weight="medium" primary>{twemojify(cTitle)}</Text>
        : cTitle
      ;
  }

  return (
    <Modal
      show={isOpen}
      onHide={onRequestClose}
      onExited={onAfterClose}
      dialogClassName={className === null ? `${size} modal-dialog-scrollable modal-popup` : `${className} ${size} modal-dialog-scrollable modal-popup`}
    >
      <Modal.Header className='noselect' closeButton>
        <Modal.Title className='h5 emoji-size-fix'>{finalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='bg-bg2'>
        {haveDrawer && (
          { drawer }
        )}
        {children}
      </Modal.Body>
    </Modal>
  );

}

PopupWindow.defaultProps = {
  className: null,
  size: null,
  drawer: null,
  contentTitle: null,
  onAfterClose: null,
  onRequestClose: null,
};

PopupWindow.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired,
  contentTitle: PropTypes.node,
  drawer: PropTypes.node,
  onAfterClose: PropTypes.func,
  onRequestClose: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export { PopupWindow as default, PWContentSelector };
