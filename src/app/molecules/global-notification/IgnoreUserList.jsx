import React from 'react';
import './IgnoreUserList.scss';

import initMatrix from '../../../client/initMatrix';
import * as roomActions from '../../../client/action/room';

import Chip from '../../atoms/chip/Chip';
import Input from '../../atoms/input/Input';
import Button from '../../atoms/button/Button';
import SettingTile from '../setting-tile/SettingTile';

import { useAccountData } from '../../hooks/useAccountData';

function IgnoreUserList() {
  useAccountData('m.ignored_user_list');
  const ignoredUsers = initMatrix.matrixClient.getIgnoredUsers();

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const { ignoreInput } = evt.target.elements;
    const value = ignoreInput.value.trim();
    const userIds = value.split(' ').filter((v) => v.match(/^@\S+:\S+$/));
    if (userIds.length === 0) return;
    ignoreInput.value = '';
    roomActions.ignore(userIds);
  };

  return (
    <div className="card noselect mt-3">
      <ul className="list-group list-group-flush">

        <li className="list-group-item very-small text-gray">Ignored users</li>

        <SettingTile
          title="Ignore user"
          content={(
            <div className="ignore-user-list__users">
              <div className="very-small text-gray">Ignore userId if you do not want to receive their messages or invites.</div>
              <form onSubmit={handleSubmit}>
                <div>
                  <Input name="ignoreInput" required />
                </div>
                <Button variant="primary" type="submit">Ignore</Button>
              </form>
              {ignoredUsers.length > 0 && (
                <div>
                  {ignoredUsers.map((uId) => (
                    <Chip
                      faSrc="fa-solid fa-xmark"
                      key={uId}
                      text={uId}
                      // iconColor={CrossIC}
                      onClick={() => roomActions.unignore([uId])}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        />

      </ul>
    </div>
  );
}

export default IgnoreUserList;
