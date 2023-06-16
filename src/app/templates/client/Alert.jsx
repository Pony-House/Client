import Modal from 'react-bootstrap/Modal';
import React from 'react';
import { twemojify } from '../../../util/twemojify';

function Alert() {
    const [isOpen, setIsOpen] = React.useState(false);

    global.alert = (text = '', title = 'App Alert') => {
        setTimeout(() => {

            setIsOpen(true);

            const tinyBody = document.querySelector('#app-alert .modal-body');
            const tinyTitle = document.querySelector('#app-alert .modal-title');

            tinyTitle.innerHTML = twemojify(title);
            tinyBody.innerHTML = twemojify(text);

        }, 100);
    };

    return (
        <Modal
            show={isOpen}
            id='app-alert'
            dialogClassName='modal-dialog-centered modal-dialog-scrollable'
            onHide={() => setIsOpen(false)}
        >
            <Modal.Header className='noselect' closeButton>
                <Modal.Title className='h5' />
            </Modal.Header>
            <Modal.Body className='text-freedom noselect' />
        </Modal>
    );

}

export default Alert;