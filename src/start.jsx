import React from 'react';
import * as ReactDOM from 'react-dom/client';
import clone from 'clone';
import { Buffer } from 'buffer';

import { startWeb3 } from './util/web3';
import startQuery from './util/libs/jquery';

import { startSettings } from './client/state/settings';
import { getPWADisplayMode } from "./util/PWA.js";

import App from './app/pages/App';
import { startCustomThemes } from '../mods';
import { getOsSettings } from './util/libs/osSettings';
import Chatroom from './app/embed/Chatroom';

function startApp(appProtocol) {

    global.getEnvApp = () => clone(__ENV_APP__);
    global.Buffer = Buffer;

    const params = new URLSearchParams(window.location.search);
    const pageType = params.get('type');
    const pageId = params.get('id');

    const osSettings = getOsSettings();
    startCustomThemes();
    startSettings();

    getPWADisplayMode();
    startQuery();

    const root = ReactDOM.createRoot(document.getElementById('root'));

    if (
        typeof pageType === 'string' && pageType.length > 0 &&
        typeof pageId === 'string' && pageId.length > 0
    ) {

        if (pageType === 'chatroom') {
            const hs = params.get('hs');
            return root.render(<Chatroom
                roomId={pageId}
                homeserver={typeof hs === 'string' && hs.length ? hs : null}
                joinGuest={params.get('join_guest')}
                refreshTime={params.get('refresh_time')}
                usernameHover={params.get('username_hover')}
                theme={params.get('theme')}
            />);
        }

        return root.render('');

    }

    startWeb3();

    console.log(`[app] Starting app using the protocol "${appProtocol}" mode.`);
    if (osSettings.startMinimized && typeof global.electronWindowIsVisible === 'function') {
        global.electronWindowIsVisible(false);
    }

    return root.render(<App />);

}

export default startApp;
