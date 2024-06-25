import React, { useState } from 'react';
import userPid from '@src/util/libs/userPid';
import { registerValidator } from '@src/util/register';

import SettingTile from '@src/app/molecules/setting-tile/SettingTile';
import SettingsText from '@src/app/molecules/settings-text/SettingsText';

import initMatrix from '../../../../client/initMatrix';

function AccountSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [email, setEmail] = useState(null);

  const mx = initMatrix.matrixClient;

  const accountValidation = registerValidator({
    username: mx.getUserId().split(':')[0].substring(1),
    password: newPassword,
    confirmPassword: newPassword2,
    email: email !== null ? email : '',
  });

  return (
    <>
      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Password</li>

          <SettingTile
            title="Current password"
            content={
              <>
                <SettingsText
                  placeHolder="Your password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  maxLength={100}
                  isPassword
                  content={
                    <div className="very-small text-gray">
                      Put your password here to confirm any changes you try to make in your account.
                      For safety this field will always be empty after performing an action on this
                      page.
                    </div>
                  }
                />
              </>
            }
          />

          <SettingTile
            title="Set a new account password…"
            content={
              <>
                <SettingsText
                  placeHolder="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  maxLength={100}
                  isPassword
                />
                <SettingsText
                  placeHolder="Confirm the new password"
                  value={newPassword2}
                  onChange={setNewPassword2}
                  maxLength={100}
                  isPassword
                  content={
                    accountValidation.password || accountValidation.confirmPassword ? (
                      <div className="very-small text-danger">
                        {!accountValidation.confirmPassword && accountValidation.password && (
                          <div className="password">{accountValidation.password}</div>
                        )}
                        {accountValidation.confirmPassword && (
                          <div className="confirmPassword">{accountValidation.confirmPassword}</div>
                        )}
                      </div>
                    ) : null
                  }
                />
              </>
            }
          />
        </ul>
      </div>
    </>
  );
}

export default AccountSection;
