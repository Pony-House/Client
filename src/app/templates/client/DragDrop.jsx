
import React, { useState } from 'react';

import navigation from '../../../client/state/navigation';
import cons from '../../../client/state/cons';
import initMatrix from '../../../client/initMatrix';


function DragDrop({ children, navWrapperRef, }) {

    const [dragCounter, setDragCounter] = useState(0);

    function dragContainsFiles(e) {
        if (!e.dataTransfer.types) return false;

        for (let i = 0; i < e.dataTransfer.types.length; i += 1) {
            if (e.dataTransfer.types[i] === 'Files') return true;
        }
        return false;
    }

    function modalOpen() {
        return navigation.isRawModalVisible && dragCounter <= 0;
    }

    function handleDragOver(e) {

        if (!dragContainsFiles(e)) return;

        e.preventDefault();

        if (!navigation.selectedRoomId || modalOpen()) {
            e.dataTransfer.dropEffect = 'none';
        }

    }

    function handleDragEnter(e) {

        e.preventDefault();

        if (navigation.selectedRoomId && !modalOpen() && dragContainsFiles(e)) {
            setDragCounter(dragCounter + 1);
        }

    }

    function handleDragLeave(e) {

        e.preventDefault();

        if (navigation.selectedRoomId && !modalOpen() && dragContainsFiles(e)) {
            setDragCounter(dragCounter - 1);
        }

    }

    function handleDrop(e) {

        e.preventDefault();

        setDragCounter(0);

        if (modalOpen()) return;

        const roomId = navigation.selectedRoomId;
        if (!roomId) return;

        const { files } = e.dataTransfer;
        if (!files?.length) return;

        const file = files[0];
        initMatrix.roomsInput.setAttachment(roomId, file);
        initMatrix.roomsInput.emit(cons.events.roomsInput.ATTACHMENT_SET, file);

    }

    return (
        <>
            <div id='dropzone' />
            <div
                ref={navWrapperRef}
                className="client-container"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {children}
            </div>
        </>
    );

};

export default DragDrop;