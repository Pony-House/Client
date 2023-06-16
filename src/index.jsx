import React from 'react';
import ReactDom from 'react-dom';
import 'highlight.js/styles/github.css';
import './default.scss';
import './index.scss';

import { startWeb3 } from './util/web3';

import settings from './client/state/settings';
import { getPWADisplayMode } from '../src/util/PWA.js'

import App from './app/pages/App';

getPWADisplayMode();
settings.applyTheme();
startWeb3();

ReactDom.render(<App />, document.getElementById('root'));
