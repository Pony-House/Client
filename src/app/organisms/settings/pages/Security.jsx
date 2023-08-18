import React from 'react';

import SettingTile from '../../../molecules/setting-tile/SettingTile';
import ImportE2ERoomKeys from '../../../molecules/import-export-e2e-room-keys/ImportE2ERoomKeys';
import ExportE2ERoomKeys from '../../../molecules/import-export-e2e-room-keys/ExportE2ERoomKeys';

import CrossSigning from '../CrossSigning';
import KeyBackup from '../KeyBackup';
import DeviceManage from '../DeviceManage';

function SecuritySection() {
    return (
        <div className="noselect">

            <div className="card noselect mb-3">
                <ul className="list-group list-group-flush">
                    <li className="list-group-item very-small text-gray">Cross signing and backup</li>
                    <CrossSigning />
                    <KeyBackup />
                </ul>
            </div>

            <DeviceManage />

            <div className="card noselect mt-3">
                <ul className="list-group list-group-flush mt-3">

                    <li className="list-group-item very-small text-gray">Export/Import encryption keys</li>

                    <SettingTile
                        title="Export E2E room keys"
                        content={(
                            <>
                                <div className="very-small text-gray">Export end-to-end encryption room keys to decrypt old messages in other session. In order to encrypt keys you need to set a password, which will be used while importing.</div>
                                <ExportE2ERoomKeys />
                            </>
                        )}
                    />

                    <SettingTile
                        title="Import E2E room keys"
                        content={(
                            <>
                                <div className="very-small text-gray">{'To decrypt older messages, Export E2EE room keys from Element (Settings > Security & Privacy > Encryption > Cryptography) and import them here. Imported keys are encrypted so you\'ll have to enter the password you set in order to decrypt it.'}</div>
                                <ImportE2ERoomKeys />
                            </>
                        )}

                    />
                </ul>
            </div>

        </div>
    );
};

export default SecuritySection;