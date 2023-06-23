import React from 'react';
import * as ReactDOM from 'react-dom/client';
import 'highlight.js/styles/github.css';
import './default.scss';
import './index.scss';

import { startWeb3 } from './util/web3';

import settings from './client/state/settings';
import { getPWADisplayMode } from "./util/PWA.js"

import App from './app/pages/App';

getPWADisplayMode();
settings.applyTheme();
startWeb3();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
