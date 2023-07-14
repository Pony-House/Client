import Modal from 'react-bootstrap/Modal';
import React from 'react';
import { twemojify } from '../../../util/twemojify';

function Alert() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [title, setTitle] = React.useState('App Alert');
    const [body, setBody] = React.useState('');

    global.alert = (text = '', title = 'App Alert') => {
        setTitle(title);
        setBody(twemojify(text));
        setIsOpen(true);
    };

    return (
        <Modal
            show={isOpen}
            id='app-alert'
            dialogClassName='modal-dialog-centered modal-dialog-scrollable'
            onHide={() => setIsOpen(false)}
        >
            <Modal.Header className='noselect' closeButton>
                <Modal.Title className='h5'>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='small text-freedom noselect p-4'>{body}</Modal.Body>
        </Modal>
    );

}

export default Alert;