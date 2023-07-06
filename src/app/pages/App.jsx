import React from 'react';

import { isAuthenticated } from '../../client/state/auth';

import Auth from '../templates/auth/Auth';
import Client from '../templates/client/Client';
import { refreshLang } from '../../lang';

function App() {
  refreshLang();
  return isAuthenticated() ? <Client /> : <Auth />;
}

export default App;
