import React, { useState, useEffect } from 'react';
import { getAppearance } from '@src/util/libs/appearance';
import matrixProxy, {
  canProxy,
  getProxyStorage,
  setProxyStorage,
  toggleProxyAction,
} from '@src/util/libs/proxy';

import SettingNumber from '@src/app/molecules/setting-number/SettingNumber';
import SettingText from '@src/app/molecules/setting-text/SettingText';
import SegmentedControls from '@src/app/atoms/segmented-controls/SegmentedControls';

import initMatrix from '../../../../client/initMatrix';
import Toggle from '../../../atoms/button/Toggle';
import SettingTile from '../../../molecules/setting-tile/SettingTile';

import { toggleAction } from '../Api';
import Button from '@src/app/atoms/button/Button';

function PrivacySection() {
  const [hideTypingWarn, setHideTypingWarn] = useState(false);
  const [roomAutoRefuse, setRoomAutoRefuse] = useState(false);
  const [sendReadReceipts, setSendReadReceipts] = useState(false);
  const [autoEncryptCreateDM, setAutoEncryptCreateDM] = useState(true);

  const [proxyEnabled, setProxyEnabled] = useState(getProxyStorage('enabled'));
  const [proxyProtocol, setProxyProtocol] = useState(getProxyStorage('protocol'));
  const [proxyAddress, setProxyAddress] = useState(getProxyStorage('address'));
  const [proxyPort, setProxyPort] = useState(getProxyStorage('port'));
  const [proxyMode, setProxyMode] = useState(getProxyStorage('mode'));

  const basicUserMode = getAppearance('basicUserMode');

  useEffect(() => {
    const content =
      initMatrix.matrixClient.getAccountData('pony.house.privacy')?.getContent() ?? {};
    setHideTypingWarn(content.hideTypingWarn === true);
    setRoomAutoRefuse(content.roomAutoRefuse === true);
    setAutoEncryptCreateDM(
      !__ENV_APP__.DISABLE_ENCRYPT_SETTINGS
        ? typeof content.autoEncryptCreateDM === 'boolean'
          ? content.autoEncryptCreateDM
          : !!__ENV_APP__.AUTO_ENCRYPT_CREATE_DM
        : false,
    );
    setSendReadReceipts(
      typeof content.sendReadReceipts !== 'boolean' || content.sendReadReceipts === true,
    );
  }, []);

  return (
    <div>
      {canProxy() ? (
        <div className="card noselect">
          <ul className="list-group list-group-flush">
            <li className="list-group-item very-small text-gray">Proxy</li>

            <SettingTile
              title="Enabled"
              options={
                <Toggle
                  className="d-inline-flex"
                  onToggle={toggleProxyAction('enabled', setProxyEnabled)}
                  isActive={proxyEnabled}
                />
              }
              content={
                <div className="very-small text-gray">
                  Enable your defined proxy settings. Remember that you need to refresh the proxy
                  for the settings to be applied!
                </div>
              }
            />

            <SettingTile
              title="Mode"
              content={
                <>
                  <div className="mt-2">
                    <SegmentedControls
                      type="select"
                      selected={matrixProxy.modes.findIndex((mode) => mode.value === proxyMode)}
                      segments={matrixProxy.modes}
                      onEmpty={() => {
                        matrixProxy.reset('mode');
                        setProxyMode(matrixProxy.get('mode'));
                      }}
                      onSelect={(index) => {
                        const mode = matrixProxy.modes[index];
                        if (mode && typeof mode.value === 'string') {
                          matrixProxy.set('mode', mode.value);
                          setProxyMode(mode.value);
                        }
                      }}
                    />
                  </div>
                  <div className="very-small text-gray">
                    The proxy mode. In system mode the proxy configuration is taken from the
                    operating system. In custom mode the proxy configuration is specified in the
                    software settings.
                  </div>
                </>
              }
            />

            {proxyMode !== 'system' ? (
              <>
                <SettingTile
                  title="Protocol"
                  content={
                    <>
                      <div className="mt-2">
                        <SegmentedControls
                          type="select"
                          selected={matrixProxy.protocols.findIndex(
                            (protocol) => protocol.value === proxyProtocol,
                          )}
                          segments={matrixProxy.protocols}
                          onEmpty={() => {
                            matrixProxy.reset('protocol');
                            setProxyProtocol(matrixProxy.get('protocol'));
                          }}
                          onSelect={(index) => {
                            const protocol = matrixProxy.protocols[index];
                            if (protocol && typeof protocol.value === 'string') {
                              matrixProxy.set('protocol', protocol.value);
                              setProxyProtocol(protocol.value);
                            }
                          }}
                        />
                      </div>
                      <div className="very-small text-gray">The proxy protocol.</div>
                    </>
                  }
                />

                <SettingTile
                  title="Address"
                  content={
                    <>
                      <SettingText
                        value={proxyAddress}
                        onChange={(value) => {
                          setProxyStorage('address', value);
                          setProxyAddress(value);
                        }}
                        maxLength={100}
                      />
                      <div className="very-small text-gray">
                        IP address or domain of your proxy.
                      </div>
                    </>
                  }
                />

                <SettingTile
                  title="Port"
                  content={
                    <>
                      <SettingNumber
                        onChange={(value) => {
                          setProxyStorage('port', value);
                          setProxyPort(value);
                        }}
                        value={proxyPort}
                        min={0}
                      />
                      <div className="very-small text-gray">The proxy port.</div>
                    </>
                  }
                />

                <SettingTile
                  title="Applying your new proxy settings"
                  content={
                    <>
                      <div className="mt-2 mb-1">
                        <Button
                          onClick={() => {
                            matrixProxy.updateProxy();
                            alert('Your proxy has been successfully updated.', 'Proxy alert');
                          }}
                          variant="theme"
                        >
                          Refresh Proxy
                        </Button>
                      </div>
                      <div className="very-small text-gray">
                        Click the button to refresh the proxy. If you configure an incorrect proxy,
                        you will lose the client connection.
                      </div>
                    </>
                  }
                />
              </>
            ) : null}
          </ul>
        </div>
      ) : null}

      <div className="card noselect mt-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Rooms</li>

          <SettingTile
            title={'Disable the "typing" warning'}
            options={
              <Toggle
                className="d-inline-flex"
                isActive={hideTypingWarn}
                onToggle={toggleAction('pony.house.privacy', 'hideTypingWarn', setHideTypingWarn)}
              />
            }
            content={
              <div className="very-small text-gray">
                Users will no longer be able to see whether or not you are typing.
              </div>
            }
          />

          {!basicUserMode ? (
            <SettingTile
              title="Auto refuse room and space invites"
              options={
                <Toggle
                  className="d-inline-flex"
                  isActive={roomAutoRefuse}
                  onToggle={toggleAction('pony.house.privacy', 'roomAutoRefuse', setRoomAutoRefuse)}
                />
              }
              content={
                <div className="very-small text-gray">
                  All invitations will automatically attempt to be refused. Whitelisted users will
                  be ignored by this option. (The whitelisted user must be the owner of the DM or
                  room for it to work.)
                </div>
              }
            />
          ) : null}

          <SettingTile
            title="Send read receipts"
            options={
              <Toggle
                className="d-inline-flex"
                isActive={sendReadReceipts}
                onToggle={toggleAction(
                  'pony.house.privacy',
                  'sendReadReceipts',
                  setSendReadReceipts,
                )}
              />
            }
            content={
              <div className="very-small text-gray">
                Let other people know what messages you read.
              </div>
            }
          />
        </ul>
      </div>

      {!__ENV_APP__.DISABLE_ENCRYPT_SETTINGS ? (
        <div className="card noselect mt-3">
          <ul className="list-group list-group-flush">
            <li className="list-group-item very-small text-gray">DMs</li>

            <SettingTile
              title="Enable auto encrypt in DM creation"
              options={
                <Toggle
                  className="d-inline-flex"
                  isActive={autoEncryptCreateDM}
                  onToggle={toggleAction(
                    'pony.house.privacy',
                    'autoEncryptCreateDM',
                    setAutoEncryptCreateDM,
                  )}
                />
              }
              content={
                <div className="very-small text-gray">
                  All DM rooms you create will have encryption enabled by default.
                </div>
              }
            />
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default PrivacySection;
