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

function startApp(appProtocol) {

    const osSettings = getOsSettings();
    startCustomThemes();
    startSettings();

    getPWADisplayMode();

    startWeb3();
    startQuery();

    console.log(`[app] Starting app using the protocol "${appProtocol}" mode.`);
    global.getEnvApp = () => clone(__ENV_APP__);
    global.Buffer = Buffer;

    if (osSettings.startMinimized && typeof global.electronWindowIsVisible === 'function') {
        global.electronWindowIsVisible(false);
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    return root.render(<App />);

}

export default startApp;
