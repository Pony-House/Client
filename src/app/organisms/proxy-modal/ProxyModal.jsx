import React, { useState, useEffect } from 'react';
import Button from '@src/app/atoms/button/Button';
import matrixProxy, {
  getProxyStorage,
  setProxyStorage,
  toggleProxyAction,
} from '@src/util/libs/proxy';

import SettingNumber from '@src/app/molecules/setting-number/SettingNumber';
import SettingText from '@src/app/molecules/setting-text/SettingText';
import SegmentedControls from '@src/app/atoms/segmented-controls/SegmentedControls';

import Toggle from '@src/app/atoms/button/Toggle';
import SettingTile from '../../molecules/setting-tile/SettingTile';

import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';

import Dialog from '../../molecules/dialog/Dialog';

function ProxyModal() {
  const [isOpen, setIsOpen] = useState(false);

  const [proxyEnabled, setProxyEnabled] = useState(getProxyStorage('enabled'));
  const [proxyProtocol, setProxyProtocol] = useState(getProxyStorage('protocol'));
  const [proxyAddress, setProxyAddress] = useState(getProxyStorage('address'));
  const [proxyPort, setProxyPort] = useState(getProxyStorage('port'));
  const [proxyMode, setProxyMode] = useState(getProxyStorage('mode'));

  const closeDialog = () => setIsOpen(false);
  const afterClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const openChangelog = () => {
      setIsOpen(true);
    };

    const updateEnabled = (value) => setProxyEnabled(value);
    const updateProtocol = (value) => setProxyProtocol(value);
    const updateAddress = (value) => setProxyAddress(value);
    const updatePort = (value) => setProxyPort(value);
    const updateMode = (value) => setProxyMode(value);

    matrixProxy.on('enabled', updateEnabled);
    matrixProxy.on('protocol', updateProtocol);
    matrixProxy.on('address', updateAddress);
    matrixProxy.on('port', updatePort);
    matrixProxy.on('mode', updateMode);

    navigation.on(cons.events.navigation.PROXY_MODAL_OPENED, openChangelog);
    return () => {
      matrixProxy.off('enabled', updateEnabled);
      matrixProxy.off('protocol', updateProtocol);
      matrixProxy.off('address', updateAddress);
      matrixProxy.off('port', updatePort);
      matrixProxy.off('mode', updateMode);

      navigation.removeListener(cons.events.navigation.PROXY_MODAL_OPENED, openChangelog);
    };
  });

  // Read Modal
  return (
    <Dialog
      bodyClass="bg-bg2 p-0"
      className="modal-dialog-centered modal-lg noselect modal-dialog-changelog"
      isOpen={isOpen}
      title="Proxy settings"
      onAfterClose={afterClose}
      onRequestClose={closeDialog}
    >
      <div className="p-4 pb-3">
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
              </>
            ) : null}
          </ul>
        </div>

        <center>
          <div className="mt-3 mb-1">
            <Button
              onClick={() => {
                matrixProxy.updateProxy();
                alert('Your proxy has been successfully updated.', 'Proxy alert');
              }}
              variant="primary"
            >
              Refresh Proxy
            </Button>
          </div>
          <div className="very-small text-gray">
            Click the button to refresh the proxy. If you configure an incorrect proxy, you will
            lose the client connection.
          </div>
        </center>
      </div>
    </Dialog>
  );
}

export default ProxyModal;
