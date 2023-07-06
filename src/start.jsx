import React from 'react';
import * as ReactDOM from 'react-dom/client';

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

    console.log(`Starting app using the protocol "${appProtocol}" mode.`);

    const root = ReactDOM.createRoot(document.getElementById('root'));
    return root.render(<App />);

}

export default startApp;
