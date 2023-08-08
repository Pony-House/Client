import React, { useState, useEffect, useRef } from 'react';

import PropTypes from 'prop-types';

import Text from '../../../atoms/text/Text';
import * as auth from '../../../../client/action/auth';
import { Debounce } from '../../../../util/common';
import { getBaseUrl } from '../../../../util/matrixUtil';
import IconButton from '../../../atoms/button/IconButton';
import Input from '../../../atoms/input/Input';
import Spinner from '../../../atoms/spinner/Spinner';
import ContextMenu, { MenuItem, MenuHeader } from '../../../atoms/context-menu/ContextMenu';

let searchingHs = null;
function Homeserver({ onChange }) {
    const [hs, setHs] = useState(null);
    const [debounce] = useState(new Debounce());
    const [process, setProcess] = useState({ isLoading: true, message: 'Loading homeserver list...' });
    const hsRef = useRef();

    const setupHsConfig = async (servername) => {
        setProcess({ isLoading: true, message: 'Looking for homeserver...' });
        let baseUrl = null;
        baseUrl = await getBaseUrl(servername);

        if (searchingHs !== servername) return;
        setProcess({ isLoading: true, message: `Connecting to ${baseUrl}...` });
        const tempClient = auth.createTemporaryClient(baseUrl);

        Promise.allSettled([tempClient.loginFlows(), tempClient.register()])
            .then((values) => {
                const loginFlow = values[0].status === 'fulfilled' ? values[0]?.value : undefined;
                const registerFlow = values[1].status === 'rejected' ? values[1]?.reason?.data : undefined;
                if (loginFlow === undefined || registerFlow === undefined) throw new Error();

                if (searchingHs !== servername) return;
                onChange({ baseUrl, login: loginFlow, register: registerFlow });
                setProcess({ isLoading: false });
            }).catch(() => {
                if (searchingHs !== servername) return;
                onChange(null);
                setProcess({ isLoading: false, error: 'Unable to connect. Please check your input.' });
            });
    };

    useEffect(() => {
        onChange(null);
        if (hs === null || hs?.selected.trim() === '') return;
        searchingHs = hs.selected;
        setupHsConfig(hs.selected);
    }, [hs]);

    useEffect(() => {

        const authSync = async () => {

            try {

                const result = await (await fetch(`${window.location.origin}${window.location.pathname}config.json`, { method: 'GET' })).json();

                const selectedHs = result?.defaultHomeserver;
                const hsList = result?.homeserverList;
                const allowCustom = result?.allowCustomHomeservers ?? true;

                if (!hsList?.length > 0 || selectedHs < 0 || selectedHs >= hsList?.length) {
                    throw new Error();
                }

                let selectedServer = hsList[selectedHs];
                if (typeof window.location.hash === 'string' && window.location.hash.startsWith('#') && window.location.hash.length > 1) {
                    selectedServer = window.location.hash.substring(1);
                    if (hsList.indexOf(selectedServer) < 0) hsList.push(selectedServer);
                }

                setHs({ selected: selectedServer, list: hsList, allowCustom });

            } catch {
                setHs({ selected: '', list: [''], allowCustom: true });
            }

        };

        authSync();

    }, []);

    const handleHsInput = (e) => {
        const { value } = e.target;
        setProcess({ isLoading: false });
        debounce._(async () => {
            setHs({ ...hs, selected: value.trim() });
        }, 700)();
    };

    return (
        <>
            <div className="homeserver-form">
                <div className='w-100'>
                    <Input
                        name="homeserver"
                        onChange={handleHsInput}
                        value={hs?.selected}
                        forwardRef={hsRef}
                        label="Homeserver"
                        disabled={hs === null || !hs.allowCustom}
                    />
                </div>
                <ContextMenu
                    placement="right"
                    content={(hideMenu) => (
                        <>
                            <MenuHeader>Homeserver list</MenuHeader>
                            {
                                hs?.list.map((hsName) => (
                                    <MenuItem
                                        key={hsName}
                                        onClick={() => {
                                            hideMenu();
                                            hsRef.current.value = hsName;
                                            setHs({ ...hs, selected: hsName });
                                        }}
                                    >
                                        {hsName}
                                    </MenuItem>
                                ))
                            }
                        </>
                    )}
                    render={(toggleMenu) => <IconButton onClick={toggleMenu} fa="fa-solid fa-server" />}
                />
            </div>
            {process.error !== undefined && <Text className="homeserver-form__error" variant="b3">{process.error}</Text>}
            {process.isLoading && (
                <div className="homeserver-form__status flex--center">
                    <Spinner size="small" />
                    <Text variant="b2">{process.message}</Text>
                </div>
            )}
        </>
    );
}
Homeserver.propTypes = {
    onChange: PropTypes.func.isRequired,
};

export default Homeserver;