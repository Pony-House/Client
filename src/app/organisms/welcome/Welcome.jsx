import React from 'react';
import { openUrl } from '@src/util/message/urlProtection';

import cons from '@src/client/state/cons';
import Img from '@src/app/atoms/image/Image';

import Button from '@src/app/atoms/button/Button';
import { openSettings } from '@src/client/action/navigation';

import { tabText } from '../settings/Settings';
import tinyAPI from '../../../util/mods';

function Welcome() {
  const tinyWelcome = {
    html: (
      <div
        className="tiny-welcome p-3 border-0 rounded d-flex justify-content-center w-100 h-100 noselect"
        style={{ alignItems: 'center' }}
      >
        <center>
          <Img
            className="app-welcome__logo noselect"
            src="./img/png/cinny-main.png"
            alt="App logo"
          />

          <h2 className="mt-3">
            {`Welcome to ${__ENV_APP__.INFO.name} `}
            <strong className="small">{cons.version}</strong>
          </h2>

          <h6>{__ENV_APP__.INFO.welcome}</h6>
          <div className="d-grid gap-2 col-8 mx-auto my-3">
            <Button
              variant="primary"
              size="md"
              className="small"
              onClick={() => openUrl('https://github.com/Pony-House/Client')}
            >
              <i className="fa-solid fa-code me-2" /> Source Code
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="small"
              onClick={() => openSettings(tabText.DONATE)}
            >
              <i className="fa-solid fa-heart me-2" /> Support
            </Button>
          </div>
        </center>
      </div>
    ),
  };

  tinyAPI.emit('startWelcomePage', tinyWelcome);
  return tinyWelcome.html;
}

export default Welcome;
