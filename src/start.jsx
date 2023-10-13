import React from 'react';
import * as ReactDOM from 'react-dom/client';
import clone from 'clone';
import { Buffer } from 'buffer';

import { startWeb3 } from './util/web3';
import startQuery from './util/libs/jquery';

import settings from './client/state/settings';
import { getPWADisplayMode } from "./util/PWA.js";

import App from './app/pages/App';

function startApp(appProtocol) {

    getPWADisplayMode();
    settings.applyTheme();
    startWeb3();
    startQuery();

    console.log(`[app] Starting app using the protocol "${appProtocol}" mode.`);
    global.getEnvApp = () => clone(__ENV_APP__);
    global.Buffer = Buffer;

    const root = ReactDOM.createRoot(document.getElementById('root'));
    return root.render(<App />);

}

export default startApp;
