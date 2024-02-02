import React, { useEffect, useRef } from 'react';

import navigation from '../../../client/state/navigation';
import cons from '../../../client/state/cons';
import initMatrix from '../../../client/initMatrix';

function DragDrop({ children, navWrapperRef }) {
  const dropZone = useRef(null);

  function dragContainsFiles(e) {
    if (!e.dataTransfer.types) return false;

    for (let i = 0; i < e.dataTransfer.types.length; i += 1) {
      if (e.dataTransfer.types[i] === 'Files') return true;
    }

    return false;
  }

  function dropAllowed() {
    const dropWrap = $(dropZone.current);
    return (
      !navigation.isRawModalVisible && dropWrap.length > 0 && dropWrap.hasClass('drag-enabled')
    );
  }

  function handleDragOver(event) {
    const e = event.originalEvent;
    if (!dragContainsFiles(e)) return;

    if (!navigation.selectedRoomId) {
      e.dataTransfer.dropEffect = 'none';
    } else {
      $(dropZone.current).addClass('drag-enabled');
    }
  }

  function handleDragEnter(event) {
    if (navigation.selectedRoomId && dragContainsFiles(event.originalEvent)) {
      $(dropZone.current).addClass('drag-enabled');
    } else {
      $(dropZone.current).removeClass('drag-enabled');
    }
  }

  function handleDragLeave() {
    $(dropZone.current).removeClass('drag-enabled');
  }

  function handleDrop(event) {
    const e = event.originalEvent;
    e.preventDefault();
    if (!dropAllowed()) return;

    const roomId = navigation.selectedRoomId;
    if (!roomId) return;

    const { files } = e.dataTransfer;
    if (!files?.length) return;

    const file = files[0];
    initMatrix.roomsInput.setAttachment(roomId, file);
    initMatrix.roomsInput.emit(cons.events.roomsInput.ATTACHMENT_SET, file);
    if (dropZone.current) $(dropZone.current).removeClass('drag-enabled');
  }

  useEffect(() => {
    const clientContainer = $(navWrapperRef.current);

    clientContainer
      .on('dragenter', handleDragEnter)
      .on('dragover', handleDragOver)
      .on('dragleave', handleDragLeave)
      .on('drop', handleDrop);

    return () => {
      clientContainer
        .off('dragenter', handleDragEnter)
        .off('dragover', handleDragOver)
        .off('dragleave', handleDragLeave)
        .off('drop', handleDrop);
    };
  }, [navWrapperRef]);

  return (
    <>
      <div ref={dropZone} className="justify-content-center w-100 h-100 noselect" id="dropzone">
        <center>
          <img
            className="app-welcome__logo noselect"
            src="./img/png/cinny-main.png"
            alt="App logo"
          />
          <h2 className="mt-3">Drop file to upload</h2>
        </center>
      </div>
      <div ref={navWrapperRef} className="client-container">
        {children}
      </div>
    </>
  );
}

export default DragDrop;
