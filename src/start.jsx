import { HTML } from '@use-gpu/react';
import React from 'react';
import * as ReactDOM from 'react-dom/client';

import { startWeb3 } from './util/web3';
import startQuery from './util/libs/jquery';

import settings from './client/state/settings';
import { getPWADisplayMode } from "./util/PWA.js";

import App from './app/pages/App';
import isDevMode from './util/isDevMode';

const isEnabledgpu = global.localStorage.getItem('usingUseGPU');
const useGPU = (typeof isEnabledgpu === 'string' && isEnabledgpu === 'on');

function startApp(appProtocol) {

    getPWADisplayMode();
    settings.applyTheme();
    startWeb3();
    startQuery();

    console.log(`[app] Starting app using the protocol "${appProtocol}" mode.`);
    console.log(`[app] Dev Mode: ${isDevMode}`);
    global.isDevMode = isDevMode;

    const root = ReactDOM.createRoot(document.getElementById('root'));
    return useGPU ? <HTML> {root.render(<App />)} </HTML> : root.render(<App />);

}

export default startApp;
