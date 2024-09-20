import React, { useEffect, useRef, useState } from 'react';
import $ from 'jquery';

import Img from '@src/app/atoms/image/Image';

import navigation from '../../../client/state/navigation';
import cons from '../../../client/state/cons';
import initMatrix from '../../../client/initMatrix';

function DragDrop() {
  const dropZone = useRef(null);
  const [isDropping, setIsDropping] = useState(false);

  function dragContainsFiles(e) {
    if (!e.dataTransfer.types) return false;

    for (let i = 0; i < e.dataTransfer.types.length; i += 1) {
      if (e.dataTransfer.types[i] === 'Files') return true;
    }

    return false;
  }

  function dropAllowed() {
    const dropWrap = $(dropZone.current);
    return !navigation.isRawModalVisible && dropWrap.length > 0;
  }

  function handleDragOver(event) {
    const e = event;
    if (!dragContainsFiles(e)) return;

    if (!navigation.selectedRoomId) {
      e.dataTransfer.dropEffect = 'none';
    } else {
      setIsDropping(true);
    }
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragEnter(event) {
    if (navigation.selectedRoomId && dragContainsFiles(event)) {
      setIsDropping(true);
    } else {
      setIsDropping(false);
    }
    // event.preventDefault();
  }

  function handleDragLeave() {
    setIsDropping(false);
    // event.preventDefault();
  }

  function handleDrop(event) {
    const e = event;
    if (!dropAllowed()) return;

    const roomId = navigation.selectedRoomId;
    const threadId = navigation.selectedThreadId;
    if (!roomId) return;

    const { files } = e.dataTransfer;
    if (!files?.length) return;

    const file = files[0];
    initMatrix.roomsInput.setAttachment(roomId, threadId, file);
    initMatrix.roomsInput.emit(cons.events.roomsInput.ATTACHMENT_SET, file);
    setIsDropping(false);
    e.preventDefault();
    e.stopPropagation();
  }

  useEffect(() => {
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    return () => {
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
    };
  });

  return (
    <>
      <div
        ref={dropZone}
        className={`${__ENV_APP__.ELECTRON_MODE ? 'root-electron-style ' : ''}${isDropping ? 'drag-enabled ' : ''}justify-content-center w-100 h-100 noselect`}
        id="dropzone"
      >
        <center>
          <Img
            className="app-welcome__logo noselect"
            src="./img/png/cinny-main.png"
            alt="App logo"
          />
          <h2 className="mt-3">Drop file to upload</h2>
        </center>
      </div>
    </>
  );
}

export default DragDrop;
