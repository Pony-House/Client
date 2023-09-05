import React, { useState } from 'react';
import SettingTile from '../../../../molecules/setting-tile/SettingTile';
import Toggle from '../../../../atoms/button/Toggle';
import { toggleActionLocal } from '../../Api';
import { getWeb3Cfg } from '../../../../../util/web3';
import Web3Item from './Web3Item';

function Web3Section() {

    // Prepare React
    const web3Settings = getWeb3Cfg();
    const [web3Enabled, setWeb3Enabled] = useState(web3Settings.web3Enabled);

    const networks = { keys: [], values: [] };
    for (const item in web3Settings.networks) {
        networks.values.push(web3Settings.networks[item]);
        networks.keys.push(item);
    }

    // Complete Render
    return <>

        <div className="card noselect mb-3">
            <ul className="list-group list-group-flush">

                <li className="list-group-item very-small text-gray">Main Settings</li>

                <SettingTile
                    title="Enabled"
                    options={(
                        <Toggle
                            className='d-inline-flex'
                            isActive={web3Enabled}
                            onToggle={toggleActionLocal('ponyHouse-web3', 'web3Enabled', setWeb3Enabled)}
                        />
                    )}
                    content={<div className="very-small text-gray">All Pony House web3 features require this setting enabled. If you disable this option, everything related to web3 will be limited to native Pony House features only.</div>}
                />

                <li className="list-group-item very-small text-gray">
                    <button type="button" class="btn btn-sm btn-danger me-3 my-1 my-sm-0">Reset config</button>
                    <button type="button" class="btn btn-sm btn-warning me-3 my-1 my-sm-0">Recover default values</button>
                    <button type="button" class="btn btn-sm btn-success me-3 my-1 my-sm-0">Create</button>
                    <button type="button" class="btn btn-sm btn-secondary me-3 my-1 my-sm-0">Export</button>
                    <button type="button" class="btn btn-sm btn-secondary my-1 my-sm-0">Import</button>
                </li>

                <li className="list-group-item very-small text-gray">
                    For the settings to take effect, please restart the app.
                </li>

            </ul>
        </div>

        {networks.values.map((item, index) => <Web3Item item={item} networkId={networks.keys[index]} />)}

    </>;

};

export default Web3Section;