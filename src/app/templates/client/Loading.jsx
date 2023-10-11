import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

let setStatus = null;
function setLoadingPage(status) {
    if (typeof setStatus === 'function') {
        setStatus({ status });
    }
};

function LoadingPage() {

    const [systemState, setSystemState] = useState({ status: null });
    setStatus = setSystemState;

    return systemState !== null && systemState.status !== null ? <Modal dialogClassName='modal-dialog-centered modal-dialog-scrollable modal-dialog-loading-page' show >
        <Modal.Body className='noselect text-center'>

            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>

            <br />

            {systemState.status}

        </Modal.Body>
    </Modal> : null;

}

global.setLoadingPage = setLoadingPage;
export { setLoadingPage };
export default LoadingPage;
