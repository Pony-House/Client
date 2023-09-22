import * as colors from 'console-log-colors';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import clone from 'clone';

import { startWeb3 } from './util/web3';
import startQuery from './util/libs/jquery';

import settings from './client/state/settings';
import { getPWADisplayMode } from "./util/PWA.js";

import App from './app/pages/App';
import isDevMode from './util/isDevMode';

function startApp(appProtocol) {

    getPWADisplayMode();
    settings.applyTheme();
    startWeb3();
    startQuery();

    console.log(`${colors.green('[app]')} Starting app using the protocol "${appProtocol}" mode.`);
    console.log(`${colors.green('[app]')} Dev Mode: ${isDevMode}`);
    global.isDevMode = isDevMode;
    global.getEnvApp = () => clone(__ENV_APP__);

    const root = ReactDOM.createRoot(document.getElementById('root'));
    return root.render(<App />);

}

export default startApp;
