import React, { useState, useEffect, useRef } from 'react';
import SettingTile from '../../../molecules/setting-tile/SettingTile';
import Toggle from '../../../atoms/button/Toggle';
import { toggleActionLocal } from '../Api';
import { getIpfsCfg, setIpfsCfg } from '../../../../util/libs/ipfs';

function IpfsSection() {
  // Prepare React
  const ipfsSettings = getIpfsCfg();
  const [ipfsEnabled, setIpfsEnabled] = useState(ipfsSettings.ipfsEnabled);
  const [useGatewayOnOpen, setUseGatewayOnOpen] = useState(ipfsSettings.useGatewayOnOpen);

  const publicGatewayRef = useRef(null);
  const subdomainPublicGatewayRef = useRef(null);
  const apiIpfsRef = useRef(null);
  const localGatewayRef = useRef(null);

  // Effects
  useEffect(() => {
    // Template
    const clickGenerator = (where, item) => () => {
      const value = item.val();
      setIpfsCfg(where, typeof value === 'string' && value.length > 0 ? value : undefined);
    };

    // jQuery
    const htmlPublicGateway = $(publicGatewayRef.current);
    const htmlSubdomainPublicGateway = $(subdomainPublicGatewayRef.current);
    const htmlApiIpfs = $(apiIpfsRef.current);
    const htmlLocalGateway = $(localGatewayRef.current);

    // Function
    const clickPublicGateway = clickGenerator('publicGateway', htmlPublicGateway);
    const clickSubdomainPublicGateway = clickGenerator(
      'subdomainPublicGateway',
      htmlSubdomainPublicGateway,
    );
    const clickApiIpfs = clickGenerator('apiIpfs', htmlApiIpfs);
    const clickLocalGateway = clickGenerator('localGateway', htmlLocalGateway);

    // Events
    htmlPublicGateway.val(ipfsSettings.publicGateway).on('change', clickPublicGateway);
    htmlSubdomainPublicGateway
      .val(ipfsSettings.subdomainPublicGateway)
      .on('change', clickSubdomainPublicGateway);
    htmlApiIpfs.val(ipfsSettings.apiIpfs).on('change', clickApiIpfs);
    htmlLocalGateway.val(ipfsSettings.localGateway).on('change', clickLocalGateway);

    // Complete
    return () => {
      htmlPublicGateway.off('change', clickPublicGateway);
      htmlSubdomainPublicGateway.off('change', clickSubdomainPublicGateway);
      htmlApiIpfs.off('change', clickApiIpfs);
      htmlLocalGateway.off('change', clickLocalGateway);
    };
  });

  // Complete Render
  return (
    <>
      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Main Settings</li>

          <SettingTile
            title="Enabled"
            options={
              <Toggle
                className="d-inline-flex"
                isActive={ipfsEnabled}
                onToggle={toggleActionLocal('ponyHouse-ipfs', 'ipfsEnabled', setIpfsEnabled)}
              />
            }
            content={
              <div className="very-small text-gray">
                Enable ipfs protocol compatibility. (This will not disable IPFS urls format)
              </div>
            }
          />

          <SettingTile
            title="Open IPFS Url using Gateway"
            options={
              <Toggle
                className="d-inline-flex"
                isActive={useGatewayOnOpen}
                onToggle={toggleActionLocal(
                  'ponyHouse-ipfs',
                  'useGatewayOnOpen',
                  setUseGatewayOnOpen,
                )}
              />
            }
            content={
              <div className="very-small text-gray">
                Instead of trying to open the protocol directly, use the gateway settings to open
                the url using a http protocol.
              </div>
            }
          />
        </ul>
      </div>

      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Gateway</li>

          <li className="list-group-item border-0">
            <div className="mb-3">
              <label for="publicGateway" className="form-label small">
                Public Gateway
              </label>
              <input
                ref={publicGatewayRef}
                type="text"
                className="form-control form-control-bg"
                id="publicGateway"
                placeholder="https://ipfs.io/"
              />
              <div className="very-small text-gray">
                This value will be used for public gateways.
              </div>
            </div>

            <div className="mb-3">
              <label for="subdomainPublicGateway" className="form-label small">
                Public Subdomain Gateway
              </label>
              <input
                ref={subdomainPublicGatewayRef}
                type="text"
                className="form-control form-control-bg"
                id="subdomainPublicGateway"
                placeholder="https://dweb.link/"
              />
              <div className="very-small text-gray">
                This value will be used for public subdomain gateways.
              </div>
            </div>

            <div className="mb-3">
              <label for="localGateway" className="form-label small">
                Local Gateway
              </label>
              <input
                ref={localGatewayRef}
                type="text"
                className="form-control form-control-bg"
                id="localGateway"
                placeholder="http://localhost:8080/"
              />
              <div className="very-small text-gray">Set the URL of your local gateway.</div>
            </div>
          </li>
        </ul>
      </div>

      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">API</li>

          <li className="list-group-item border-0">
            <div className="mb-3">
              <label for="apiIpfs" className="form-label small">
                API Url
              </label>
              <input
                ref={apiIpfsRef}
                type="text"
                className="form-control form-control-bg"
                id="apiIpfs"
                placeholder="http://127.0.0.1:5001/"
              />
              <div className="very-small text-gray">
                Set the URL of your IPFS API. (Hint: this is where /api/v0/config lives.)
              </div>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}

export default IpfsSection;
