/* eslint-disable camelcase */
import React, { useState, useEffect, } from 'react';
import PropTypes from 'prop-types';
import { createClient } from 'matrix-js-sdk';

import RoomTimeline from '../../client/state/RoomTimeline';

function Chatroom({ roomId, homeserver }) {

    // States
    const [timeline, setTimeline] = useState(null);
    const [matrixClient, setMatrixClient] = useState(null);

    // Info
    const hsUrl = roomId.split(':')[1];
    const MATRIX_INSTANCE = `https://${homeserver || hsUrl}`;

    // const timeline = new RoomTimeline(roomId);
    console.log(timeline, matrixClient);

    useEffect(() => {

        // Guest User Mode
        const startGuest = async () => {
            if (matrixClient === null) {

                const tmpClient = await createClient(MATRIX_INSTANCE);
                const { user_id, device_id, access_token } = tmpClient.registerGuest();

                const client = createClient({
                    baseUrl: MATRIX_INSTANCE,
                    accessToken: access_token,
                    userId: user_id,
                    deviceId: device_id,
                })

                client.setGuest(true);
                return client;

            }
        };

        // Start Guest
        startGuest().then(client => setMatrixClient(client)).catch(err => console.error(err));

    }, []);

    return <>
        <div>{roomId}</div>
        <div>{homeserver}</div>
    </>;

};

Chatroom.defaultProps = {
    homeserver: null,
};

Chatroom.propTypes = {
    roomId: PropTypes.string.isRequired,
    homeserver: PropTypes.string,
};

export default Chatroom;
