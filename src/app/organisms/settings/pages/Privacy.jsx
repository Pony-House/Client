import React, { useState, useEffect } from 'react';

import initMatrix from '../../../../client/initMatrix';
import Toggle from '../../../atoms/button/Toggle';
import SettingTile from '../../../molecules/setting-tile/SettingTile';

import { toggleAction } from '../Api';

function PrivacySection() {
  const [hideTypingWarn, setHideTypingWarn] = useState(false);
  const [roomAutoRefuse, setRoomAutoRefuse] = useState(false);
  const [sendReadReceipts, setSendReadReceipts] = useState(false);
  const [autoEncryptCreateDM, setAutoEncryptCreateDM] = useState(true);

  useEffect(() => {
    const content =
      initMatrix.matrixClient.getAccountData('pony.house.privacy')?.getContent() ?? {};
    setHideTypingWarn(content.hideTypingWarn === true);
    setRoomAutoRefuse(content.roomAutoRefuse === true);
    setAutoEncryptCreateDM(
      typeof content.autoEncryptCreateDM !== 'boolean' || content.autoEncryptCreateDM === true,
    );
    setSendReadReceipts(
      typeof content.sendReadReceipts !== 'boolean' || content.sendReadReceipts === true,
    );
  }, []);

  return (
    <div>
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
                All invitations will automatically attempt to be refused. Whitelisted users will be
                ignored by this option. (The whitelisted user must be the owner of the DM or room
                for it to work.)
              </div>
            }
          />

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
    </div>
  );
}

export default PrivacySection;
