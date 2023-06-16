import React, { useState, useEffect } from 'react';

import cons from '../../../client/state/cons';

import navigation from '../../../client/state/navigation';
import Dialog from './Dialog';

function ReusableDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const handleOpen = (title, render, afterClose) => {
      setIsOpen(true);
      setData({ title, render, afterClose });
    };
    navigation.on(cons.events.navigation.REUSABLE_DIALOG_OPENED, handleOpen);
    return () => {
      navigation.removeListener(cons.events.navigation.REUSABLE_DIALOG_OPENED, handleOpen);
    };
  }, []);

  const handleAfterClose = () => {
    data.afterClose?.();
    setData(null);
  };

  const handleRequestClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog
      className="modal-dialog-scrollable noselect"
      isOpen={isOpen}
      title={data?.title || ''}
      onAfterClose={handleAfterClose}
      onRequestClose={handleRequestClose}
      invisibleScroll
    >
      {data?.render(handleRequestClose) || <div />}
    </Dialog>
  );
}

export default ReusableDialog;
