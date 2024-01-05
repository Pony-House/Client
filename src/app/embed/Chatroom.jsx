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
import { objType } from '../../util/tools';
import { join } from '../../client/action/room';
import RoomViewContent from '../organisms/room/RoomViewContent';
import RoomViewHeader from '../organisms/room/RoomViewHeader';
import settings from '../../client/state/settings';

global.Olm = Olm;

/*

    id: #test-room:example.com
    hs: example.com
    join_guest: false

    theme: silver-theme

    refresh_time: null (In minutes)

    path: /?type=chatroom&id=%23test-room%3Aexample.com&hs=example.com&theme=silver-theme

*/

function Chatroom({ roomId, homeserver, joinGuest, refreshTime, theme, }) {

    // States
    const [isLoading, setIsLoading] = useState(1);
    const [roomTimeline, setTimeline] = useState(null);
    const [errMessage, setErrorMessage] = useState(null);
    const [errCode, setErrorCode] = useState(null);

    // Theme
    if (typeof theme === 'string' && theme.length > 0) {
        const themeIndex = settings.getThemeById(theme);
        if (themeIndex !== null) {
            settings._clearTheme();
        }
    }

    // Info
    const hsUrl = roomId.split(':')[1];
    const MATRIX_INSTANCE = `https://${homeserver || hsUrl}`;

    // Load Data
    useEffect(() => {
        if (isLoading === 1) {

            // Set Loading
            setIsLoading(2);

            // Guest User Mode
            const startGuest = async () => {

                const tmpClient = await sdk.createClient({ baseUrl: MATRIX_INSTANCE, timelineSupport: true, });
                const guestData = await tmpClient.registerGuest();

                const client = sdk.createClient({

                    baseUrl: MATRIX_INSTANCE,
                    accessToken: guestData.access_token,
                    userId: guestData.user_id,
                    deviceId: guestData.device_id,
                    timelineSupport: true,

                    verificationMethods: [
                        'm.sas.v1',
                    ],

                });

                client.setGuest(true);
                initMatrix.setMatrixClient(client);
                return client;

            };

            // Get Room
            const getRoom = () => new Promise((resolve, reject) => {
                const mx = initMatrix.matrixClient;
                mx.getRoomIdForAlias(roomId).then(aliasData => {
                    if (objType(aliasData, 'object')) {

                        if (mx.isGuest() && (joinGuest === 'true' || joinGuest === true)) {

                            const via = aliasData?.servers.slice(0, 3) || [];

                            join(roomId, false, via).then(tinyRoom => {
                                setTimeline(new RoomTimeline(tinyRoom));
                                setIsLoading(0);
                            });

                        }
                        else {

                            setTimeline(new RoomTimeline(
                                aliasData.room_id, roomId, true,
                                mx.getUserId(), ((
                                    typeof refreshTime === 'string' && refreshTime.length > 0
                                ) || (
                                        typeof refreshTime === 'number' && refreshTime > 0
                                    )
                                ) ? Number(refreshTime) : null,
                            ));

                            setIsLoading(0);

                        }

                    } else {
                        setIsLoading(3);
                        console.error('Invalid room alias data object!');
                        console.log('Room alias data:', aliasData);
                        setErrorMessage('Invalid room alias data object!');
                        setErrorCode(500);
                    }
                }).catch(err => reject(err));
            });

            // Start user
            if (isAuthenticated()) {

                const iId = setInterval(() => { }, 15000);

                initMatrix.once('init_loading_finished', () => {
                    clearInterval(iId);
                    setIsLoading(0);
                });

                initMatrix.init(true).then(() => getRoom()).catch(err => { console.error(err); setIsLoading(3); setErrorMessage(err.message); setErrorCode(err.code); });

            }

            // Start Guest
            else { startGuest().then(() => getRoom()).catch(err => { console.error(err); setIsLoading(3); setErrorMessage(err.message); setErrorCode(err.code); }); }

        }
    }, []);

    // Loaded
    if (!isLoading && roomTimeline !== null) {
        return <>
            <RoomViewHeader roomId={roomId} roomItem={roomTimeline.room} roomAlias={roomTimeline.roomAlias} disableActions />
            <RoomViewContent roomTimeline={roomTimeline} isGuest={!isAuthenticated()} isUserList />
        </>;
    }

    // Error
    if (isLoading === 3) {
        return <ProcessWrapper>
            <h1 className='m-0 text-warning'><i className="fa-solid fa-triangle-exclamation" /></h1>
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
            {__ENV_APP__.INFO.name} - Room Embed
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
