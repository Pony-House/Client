import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { openReusableDialog } from '../../../client/action/navigation';
import { arrayItems as bsColorsArray } from '../../../util/styles-bootstrap';

import Button from '../../atoms/button/Button';

function ConfirmDialog({
  desc, actionTitle, actionType, onComplete,
}) {

  const textBase = useRef(null);

  useEffect(() => {
    if (textBase.current) {

      const enterInput = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) onComplete(true);
      };

      setTimeout(() => { $('body').on('keyup', enterInput); }, 100);
      return () => {
        $('body').off('keyup', enterInput);
      };

    }
  });

  return <div ref={textBase} className="confirm-dialog">
    <div className='small mb-3'>{desc}</div>
    <div className="confirm-dialog__btn">
      <Button variant={actionType} onClick={() => onComplete(true)}>{actionTitle}</Button>
      <Button onClick={() => onComplete(false)}>Cancel</Button>
    </div>
  </div>;

}
ConfirmDialog.propTypes = {
  desc: PropTypes.string.isRequired,
  actionTitle: PropTypes.string.isRequired,
  actionType: PropTypes.oneOf(bsColorsArray).isRequired,
  onComplete: PropTypes.func.isRequired,
};

/**
 * @param {string} title title of confirm dialog
 * @param {string} desc description of confirm dialog
 * @param {string} actionTitle title of main action to take
 * @param {'primary' | 'success' | 'danger' | 'warning'} actionType type of action. default=primary
 * @return {Promise<boolean>} does it get's confirmed or not
 */
// eslint-disable-next-line import/prefer-default-export
export const confirmDialog = (title, desc, actionTitle, actionType = 'primary') => new Promise((resolve) => {
  let isCompleted = false;
  openReusableDialog(
    <div className="m-0 h5">{title}</div>,
    (requestClose) => (
      <ConfirmDialog
        desc={desc}
        actionTitle={actionTitle}
        actionType={actionType}
        onComplete={(isConfirmed) => {
          isCompleted = true;
          resolve(isConfirmed);
          requestClose();
        }}
      />
    ),
    () => {
      if (!isCompleted) resolve(false);
    },
  );
});
