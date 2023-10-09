import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

let setStatus = null;
function setLoadingPage(status) {
    if (typeof setStatus === 'function') {
        setStatus(status);
    }
};

function LoadingPage() {

    const [systemState, setSystemState] = useState({ status: null, title: null });
    setStatus = setSystemState;

    return systemState !== null && systemState.status !== null ? <Modal dialogClassName='modal-dialog-centered modal-dialog-scrollable modal-dialog-loading-page' show >
        <Modal.Header className='noselect'>
            <Modal.Title className='h5'>{typeof systemState.title === 'string' && systemState.title.length > 0 ? systemState.title : 'Loading...'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='small'>
            {systemState.status}
        </Modal.Body>
    </Modal> : null;

}

export { setLoadingPage };
export default LoadingPage;
