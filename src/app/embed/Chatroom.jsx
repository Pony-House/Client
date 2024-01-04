/* eslint-disable camelcase */
import React, { useState, useEffect, } from 'react';
import PropTypes from 'prop-types';
import * as sdk from 'matrix-js-sdk';
import Olm from '@matrix-org/olm';

import { isAuthenticated } from '../../client/state/auth';

import RoomTimeline from '../../client/state/RoomTimeline';
import initMatrix from '../../client/initMatrix';
import Spinner from '../atoms/spinner/Spinner';
import ProcessWrapper from '../templates/auth/modules/ProcessWrapper';

global.Olm = Olm;

/*

    id: #test-room:example.com
    hs: example.com

    path: /?type=chatroom&id=%23test-room%3Aexample.com&hs=example.com

*/

function Chatroom({ roomId, homeserver }) {

    // States
    const [isLoading, setIsLoading] = useState(1);
    const [timeline, setTimeline] = useState(null);
    const [errMessage, setErrorMessage] = useState(null);
    const [errCode, setErrorCode] = useState(null);
    const [matrixClient, setMatrixClient] = useState(null);

    // Info
    const hsUrl = roomId.split(':')[1];
    const MATRIX_INSTANCE = `https://${homeserver || hsUrl}`;

    // Load Data
    useEffect(() => {
        if (isLoading === 1 && matrixClient === null) {

            // Set Loading
            setIsLoading(2);

            // Guest User Mode
            const startGuest = async () => {

                const tmpClient = await sdk.createClient({ baseUrl: MATRIX_INSTANCE });
                const { user_id, device_id, access_token } = tmpClient.registerGuest();

                const client = sdk.createClient({

                    baseUrl: MATRIX_INSTANCE,
                    accessToken: access_token,
                    userId: user_id,
                    deviceId: device_id,
                    timelineSupport: true,

                    verificationMethods: [
                        'm.sas.v1',
                    ],

                });

                client.setGuest(true);
                return client;

            };

            // Get Room
            const getRoom = (mx) => {

                setMatrixClient(mx);
                setTimeline(new RoomTimeline(roomId, mx));
                setIsLoading(0);

            };

            // Start user
            if (isAuthenticated()) {

                const iId = setInterval(() => { }, 15000);

                initMatrix.once('init_loading_finished', () => {
                    clearInterval(iId);
                    setIsLoading(0);
                });

                initMatrix.init(true).then(() => getRoom(initMatrix.matrixClient)).catch(err => { console.error(err); alert(err.message); setIsLoading(3); setErrorMessage(err.message); setErrorCode(err.code); });

            }

            // Start Guest
            else { startGuest().then(client => getRoom(client)).catch(err => { console.error(err); alert(err.message); setIsLoading(3); setErrorMessage(err.message); setErrorCode(err.code); }); }

        }
    }, []);

    // Loaded
    if (!isLoading && matrixClient !== null && timeline !== null) {
        console.log(timeline, matrixClient, timeline);
        return <>
            <div>{roomId}</div>
            <div>{homeserver}</div>
        </>;
    }

    // Error
    if (isLoading === 3) {
        return <ProcessWrapper>
            <h1 className='m-0 text-warning'><i class="fa-solid fa-triangle-exclamation" /></h1>
            <div style={{ marginTop: 'var(--sp-normal)' }} className='text-danger'>
                {typeof errCode === 'number' || typeof errCode === 'string' ? `${String(errCode)} - ` : ''}
                {errMessage || 'Unknown error!'}
            </div>
        </ProcessWrapper>;
    }

    // Loading
    return <ProcessWrapper>
        <Spinner />
        <div style={{ marginTop: 'var(--sp-normal)' }}>
            {__ENV_APP__.INFO.name} - Chatroom Embed
        </div>
    </ProcessWrapper>;

};

Chatroom.defaultProps = {
    homeserver: null,
};

Chatroom.propTypes = {
    roomId: PropTypes.string.isRequired,
    homeserver: PropTypes.string,
};

export default Chatroom;
