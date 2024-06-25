import React, { useEffect, useState } from 'react';
import userPid from '@src/util/libs/userPid';
import { registerValidator } from '@src/util/register';

import SettingTile from '@src/app/molecules/setting-tile/SettingTile';
import SettingsText from '@src/app/molecules/settings-text/SettingsText';
import Button from '@src/app/atoms/button/Button';
import moment, { momentFormat } from '@src/util/libs/momentjs';
import IconButton from '@src/app/atoms/button/IconButton';

import initMatrix from '../../../../client/initMatrix';
import SettingLoading from '@src/app/molecules/setting-loading/SettingLoading';

function AccountSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [newEmail, setNewEmail] = useState(null);
  const [emails, setEmails] = useState(null);
  const [phones, setPhones] = useState(null);
  const [loadingEmails, setLoadingEmails] = useState(false);

  const mx = initMatrix.matrixClient;

  const accountValidation = registerValidator({
    username: mx.getUserId().split(':')[0].substring(1),
    password: newPassword,
    confirmPassword: newPassword2,
    email: newEmail !== null ? newEmail : '',
  });

  useEffect(() => {
    if (!loadingEmails && emails === null) {
      setLoadingEmails(true);
      userPid
        .fetch()
        .then((userEmails) => {
          const tinyEmails = [];
          const tinyPhones = [];
          for (const item in userEmails) {
            if (userEmails[item].medium === 'email') tinyEmails.push(userEmails[item]);
            if (userEmails[item].medium === 'msisdn') tinyPhones.push(userEmails[item]);
          }

          setEmails(tinyEmails);
          setPhones(tinyPhones);
          setLoadingEmails(false);
        })
        .catch((err) => {
          console.error(err);
          alert(err.message, 'Get User Emails Error');
          setEmails([]);
          setLoadingEmails(false);
        });
    }
  });

  const loadItemsList = (where, title, removeClick) =>
    Array.isArray(where) && where.length > 0 ? (
      where.map((email, index) => (
        <SettingTile
          key={`${email.address}_${index}`}
          title={<div className={`small`}>{email.address}</div>}
          options={
            <IconButton
              size="small"
              className="mx-1"
              iconColor="var(--tc-danger-normal)"
              onClick={removeClick}
              fa="fa-solid fa-trash-can"
              tooltip={`Remove ${title}`}
            />
          }
          content={
            <>
              {typeof email.added_at === 'number' && (
                <div className="very-small text-gray">
                  Added at
                  <span style={{ color: 'var(--tc-surface-normal)' }}>
                    {moment(email.added_at).format(
                      ` ${momentFormat.clock()}, ${momentFormat.calendar()}`,
                    )}
                  </span>
                </div>
              )}

              {typeof email.validated_at === 'number' && (
                <div className="very-small text-gray">
                  Validated at
                  <span style={{ color: 'var(--tc-surface-normal)' }}>
                    {moment(email.validated_at).format(
                      ` ${momentFormat.clock()}, ${momentFormat.calendar()}`,
                    )}
                  </span>
                </div>
              )}
            </>
          }
        />
      ))
    ) : (
      <center className="very-small p-3"> No {title} found.</center>
    );

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
                    ) : (
                      <Button
                        variant="primary"
                        disabled={newPassword.length < 1}
                        onClick={() => {}}
                      >
                        Change Password
                      </Button>
                    )
                  }
                />
              </>
            }
          />
        </ul>
      </div>

      <div className="card mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Email addresses</li>

          {!loadingEmails ? (
            loadItemsList(emails, 'email', () => {})
          ) : (
            <SettingLoading title="Loading emails..." />
          )}

          <SettingTile
            title="Add a new account email"
            content={
              <SettingsText
                placeHolder="Email address"
                value={newEmail}
                onChange={setNewEmail}
                maxLength={100}
                isEmail
                content={
                  accountValidation.email ? (
                    <div className="very-small text-danger">
                      <span className="email">{accountValidation.email}</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      disabled={typeof newEmail !== 'string' || newEmail.length < 1}
                      onClick={() => {}}
                    >
                      Add Email
                    </Button>
                  )
                }
              />
            }
          />
        </ul>
      </div>

      <div className="card mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Phone numbers</li>

          {!loadingEmails ? (
            loadItemsList(phones, 'phone number', () => {})
          ) : (
            <SettingLoading title="Loading phone numbers..." />
          )}
        </ul>
      </div>
    </>
  );
}

export default AccountSection;
