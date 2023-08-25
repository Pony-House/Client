import React from 'react';
import tinyAPI from '../../../util/mods';

function Welcome() {

  const tinyWelcome = {
    html: <div className="tiny-welcome p-3 border-0 rounded d-flex justify-content-center w-100 h-100 noselect" style={{ alignItems: 'center' }}>
      <center>
        <img className="app-welcome__logo noselect" src="./favicon.ico" alt="Cinny logo" />

        <h2 className='mt-3'>{`Welcome to ${__ENV_APP__.info.name}`}</h2>

        <h6>{__ENV_APP__.info.welcome}</h6>

      </center>
    </div>
  };

  tinyAPI.emit('startWelcomePage', tinyWelcome);
  return tinyWelcome.html;

}

export default Welcome;
