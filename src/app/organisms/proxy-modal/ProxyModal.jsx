import React, { useState, useEffect } from 'react';
import Button from '@src/app/atoms/button/Button';

import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';

import Dialog from '../../molecules/dialog/Dialog';

function ProxyModal() {
  const [isOpen, setIsOpen] = useState(false);

  const closeDialog = () => setIsOpen(false);
  const afterClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const openChangelog = () => {
      setIsOpen(true);
    };

    navigation.on(cons.events.navigation.PROXY_MODAL_OPENED, openChangelog);
    return () => {
      navigation.removeListener(cons.events.navigation.PROXY_MODAL_OPENED, openChangelog);
    };
  });

  // Read Modal
  return (
    <Dialog
      bodyClass="bg-bg2 p-0"
      className="modal-dialog-centered modal-lg noselect modal-dialog-changelog"
      isOpen={isOpen}
      title="Proxy settings"
      onAfterClose={afterClose}
      onRequestClose={closeDialog}
    >
      <div className="p-4 pb-3"></div>
    </Dialog>
  );
}

export default ProxyModal;
