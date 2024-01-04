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
    const [matrixClient, setMatrixClient] = useState(null);

    // Info
    const hsUrl = roomId.split(':')[1];
    const MATRIX_INSTANCE = `https://${homeserver || hsUrl}`;

    // const timeline = new RoomTimeline(roomId);
    console.log(timeline, matrixClient);

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

            // Start user
            if (isAuthenticated()) {

                const iId = setInterval(() => { }, 15000);

                initMatrix.once('init_loading_finished', () => {
                    clearInterval(iId);
                    setIsLoading(0);
                });

                initMatrix.init().then(() => setMatrixClient(initMatrix.matrixClient)).catch(err => console.error(err));

            }

            // Start Guest
            else {
                startGuest().then(client => { setMatrixClient(client); setIsLoading(0); }).catch(err => console.error(err));
            }

        }
    }, []);

    // Loaded
    if (!isLoading && matrixClient !== null) {
        return <>
            <div>{roomId}</div>
            <div>{homeserver}</div>
        </>;
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
