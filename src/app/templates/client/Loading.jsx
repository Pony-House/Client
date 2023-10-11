import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';

let setStatus = null;
function setLoadingPage(status = 'Loading...', type = 'border') {
    if (typeof setStatus === 'function') {
        setStatus({ status, type });
    }
};

function LoadingPage() {

    const [systemState, setSystemState] = useState({ status: false, type: null });
    setStatus = setSystemState;

    return systemState !== null && typeof systemState.status === 'string' ? <Modal dialogClassName='modal-dialog-centered modal-dialog-scrollable modal-dialog-loading-page' animation={false} show >
        <Modal.Body className='noselect text-center'>

            <div className={`spinner-${typeof systemState.type === 'string' ? systemState.type : 'border'}`} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>

            <br />

            {systemState.status}

        </Modal.Body>
    </Modal> : null;

}

export { setLoadingPage };
export default LoadingPage;
