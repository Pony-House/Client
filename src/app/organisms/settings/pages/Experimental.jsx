import React, { useEffect, useState } from 'react';
// import storageManager from '@src/util/libs/Localstorage';

import { getAppearance, toggleAppearanceAction } from '../../../../util/libs/appearance';
import SettingTile from '../../../molecules/setting-tile/SettingTile';
import Toggle from '../../../atoms/button/Toggle';

// import Toggle from '../../../atoms/button/Toggle';
// import SettingTile from '../../../molecules/setting-tile/SettingTile';

/*

    <div className="card noselect mt-3">
        <ul className="list-group list-group-flush">
            <li className="list-group-item very-small text-gray">Chat room</li>
            <SettingTile
                title='Use GPU Mode'
                options={(
                    <Toggle
                        className='d-inline-flex'
                        isActive={isUsingUseGPU}
                        onToggle={() => {
                            const isEnabled = storageManager.getItem('usingUseGPU');
                            if (typeof isEnabled === 'string' && isEnabled === 'on') {
                                storageManager.removeItem('usingUseGPU');
                                setUsingUseGPU(false);
                            } else {
                                storageManager.setItem('usingUseGPU', 'on');
                                setUsingUseGPU(true);
                            }
                        }}
                    />
                )}
                content={<div className="very-small text-gray">This function will theoretically try to use your GPU to render the application. (You need to restart the app for the option to take effect)</div>}
            />
        </ul>
    </div>

*/

function ExperimentalSection() {
  // const [isUsingUseGPU, setUsingUseGPU] = useState(false);
  const appearanceSettings = getAppearance();
  const [noReconnectRefresh, setNoReconnectRefresh] = useState(
    appearanceSettings.noReconnectRefresh,
  );

  useEffect(() => {
    // const isEnabledgpu = storageManager.getItem('usingUseGPU');
    // setUsingUseGPU((typeof isEnabledgpu === 'string' && isEnabledgpu === 'on'));
  }, []);

  return (
    <div>
      <div className="card noselect mt-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">WARNING!</li>
          <li className="list-group-item small text-danger">
            This is a <strong>TESTING FEATURE</strong> session! Any setting enabled in this location
            is completely at <strong>your own risk</strong>!
          </li>
        </ul>
      </div>

      {!appearanceSettings.basicUserMode &&
      appearanceSettings.advancedUserMode &&
      __ENV_APP__.ELECTRON_MODE ? (
        <div className="card noselect mt-3">
          <ul className="list-group list-group-flush">
            <li className="list-group-item very-small text-gray">DevTools</li>
            <li className="list-group-item small">
              This is an area for developers only! If some strange person is asking you to click
              here for some mysterious reason, ask them!
              <br />
              <button className="btn btn-sm btn-primary mt-2" onClick={() => global.openDevTools()}>
                Open DevTools
              </button>
            </li>
          </ul>
        </div>
      ) : null}

      {!appearanceSettings.basicUserMode ? (
        <div className="card noselect mt-3">
          <ul className="list-group list-group-flush">
            <li className="list-group-item very-small text-gray">Client connection</li>

            <SettingTile
              title="Do not refresh the page during reconnection"
              options={
                <Toggle
                  className="d-inline-flex"
                  isActive={noReconnectRefresh}
                  onToggle={toggleAppearanceAction('noReconnectRefresh', setNoReconnectRefresh)}
                />
              }
              content={
                <div className="very-small text-gray">
                  When the client restores the connection, the page will not be updated. It has not
                  been fully tested whether or not this continues to desync the client.
                </div>
              }
            />
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default ExperimentalSection;
