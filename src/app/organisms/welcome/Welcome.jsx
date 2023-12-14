import React from 'react';
import tinyAPI from '../../../util/mods';
import { ENVapp } from '../../../util/tools';

function Welcome() {

  const tinyWelcome = {
    html: <div className="tiny-welcome p-3 border-0 rounded d-flex justify-content-center w-100 h-100 noselect" style={{ alignItems: 'center' }}>
      <center>
        <img className="app-welcome__logo noselect" src="./img/png/cinny-main.png" alt="App logo" />

        <h2 className='mt-3'>{`Welcome to ${ENVapp.info.name}`}</h2>

        <h6>{ENVapp.info.welcome}</h6>

      </center>
    </div>
  };

  tinyAPI.emit('startWelcomePage', tinyWelcome);
  return tinyWelcome.html;

}

export default Welcome;
