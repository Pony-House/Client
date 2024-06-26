import React, { useEffect, useState } from 'react';
import { objType } from 'for-promise/utils/lib.mjs';

import userPid from '@src/util/libs/userPid';
import { registerValidator } from '@src/util/register';

import SettingTile from '@src/app/molecules/setting-tile/SettingTile';
import SettingsText from '@src/app/molecules/settings-text/SettingsText';
import Button from '@src/app/atoms/button/Button';
import moment, { momentFormat } from '@src/util/libs/momentjs';
import IconButton from '@src/app/atoms/button/IconButton';
import { btModal } from '@src/util/tools';

import SettingLoading from '@src/app/molecules/setting-loading/SettingLoading';
import { setLoadingPage } from '@src/app/templates/client/Loading';
import { openUrl } from '@src/util/message/urlProtection';

import initMatrix from '../../../../client/initMatrix';

function AccountSection() {
  // Prepare values
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [newEmail, setNewEmail] = useState(null);
  const [newPhone, setNewPhone] = useState(null);
  const [bind] = useState(false);

  // Items list
  const [emails, setEmails] = useState(null);
  const [phones, setPhones] = useState(null);
  const [othersAuth, setOthersAuth] = useState(null);

  // Data
  const [loadingEmails, setLoadingEmails] = useState(false);
  const mx = initMatrix.matrixClient;

  // Validator
  const accountValidation = registerValidator({
    username: mx.getUserId().split(':')[0].substring(1),
    password: newPassword,
    confirmPassword: newPassword2,
    email: newEmail !== null ? newEmail : '',
  });

  // Read Data
  useEffect(() => {
    if (!loadingEmails && emails === null) {
      setLoadingEmails(true);
      userPid
        .fetch()
        .then((userEmails) => {
          const tinyEmails = [];
          const tinyPhones = [];
          const tinyOthers = [];
          for (const item in userEmails) {
            if (userEmails[item].medium === 'email') tinyEmails.push(userEmails[item]);
            else if (userEmails[item].medium === 'msisdn') tinyPhones.push(userEmails[item]);
            else tinyOthers.push(userEmails[item]);
          }

          setEmails(tinyEmails);
          setPhones(tinyPhones);
          setOthersAuth(tinyOthers);
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

  // Request a new email, phone, and more...
  const requestTokenProgress = (type, loadingTitle, request, value, wscript) => () => {
    setLoadingPage(loadingTitle);
    const tinyValue = value();
    const clientSecret = mx.generateClientSecret();
    request(tinyValue, clientSecret)
      .then((result) => {
        if (objType(result, 'object')) {
          // Process data
          const fastCache = wscript();
          fastCache.where.push({
            address: tinyValue,
            added_at: new Date(),
            validated_at: null,
          });

          fastCache.setWhere(fastCache.where);
          fastCache.complete(null);
          setLoadingPage(false);

          // Prepare modal
          let tinyModal;
          const body = [
            $('<h6>', { class: 'mb-4 noselect' }).text(
              `The request to add a new ${type} was successfully sent!`,
            ),
          ];

          body.push(
            $('<span>').text(
              `Confirm the inclusion of this ${type} using Single Sign On to prove your identity.`,
            ),
          );

          body.push($('<br>'));
          body.push($('<strong>', { class: 'small' }).text(`Session Id: ${result.sid}`));

          // Send modal
          tinyModal = btModal({
            title: 'Use "Single Sign On" to continue',
            id: 'new-email-progress',
            dialog: 'modal-lg modal-dialog-centered',
            body: $('<center>', { class: 'small' }).append(body),
            footer: [
              $('<button>', { class: 'btn btn-bg mx-2' })
                .text('Go Back')
                .on('click', () => {
                  setCurrentPassword('');
                  tinyModal.hide();
                }),

              $('<button>', { class: `btn btn-primary mx-2` })
                .text('Sign On')
                .on('click', () => {
                  // Final step
                  const finishProgress = () => {
                    // Check session
                    tinyModal.hide();
                    setLoadingPage('Checking session...');

                    // Send bindThreePid

                    const threePidAction = bind ? 'bindThreePid' : 'addThreePidOnly';
                    const threePidOptions = bind
                      ? // bindThreePid
                        {
                          client_secret: clientSecret,
                          id_access_token: initMatrix.matrixClient.getAccessToken(),
                          id_server:
                            initMatrix.matrixClient.getIdentityServerUrl(true) ||
                            initMatrix.matrixClient.baseUrl.split('://')[1],
                          sid: result.sid,
                        }
                      : // addThreePidOnly
                        {
                          sid: result.sid,
                          client_secret: clientSecret,
                        };

                    // Error
                    const sessionError = (err) => {
                      setCurrentPassword('');
                      setLoadingPage(false);
                      console.error(err);
                      alert(err.message, 'Session Verification Error');
                    };

                    // Complete
                    const sessionComplete = () => {
                      setCurrentPassword('');
                      setLoadingPage(false);
                      alert(`Your ${type} has been successfully verified!`, 'Session Verification');
                    };

                    initMatrix.matrixClient[threePidAction](threePidOptions)
                      .then(sessionComplete)

                      // Error Session
                      .catch((err) => {
                        if (!bind && objType(err.data, 'object') && Array.isArray(err.data.flows)) {
                          // err.data.session
                          // err.data.params

                          // Can Password
                          const canPassword = err.data.flows.find(
                            (item) =>
                              Array.isArray(item.stages) && item.stages[0] === 'm.login.password',
                          );

                          // Can SSO
                          const canSSO = err.data.flows.find(
                            (item) =>
                              Array.isArray(item.stages) && item.stages[0] === 'm.login.sso',
                          );

                          // Use password
                          if (canPassword && currentPassword) {
                            threePidOptions.auth = {
                              type: 'm.login.password',
                              identifier: {
                                type: 'm.id.user',
                                user: initMatrix.matrixClient
                                  .getUserId()
                                  .split(':')[0]
                                  .substring(1),
                              },
                              password: currentPassword,
                            };

                            // Last try
                            initMatrix.matrixClient[threePidAction](threePidOptions)
                              .then(sessionComplete)
                              .catch(sessionError);
                          }
                        }

                        // Fail
                        else {
                          sessionError(err);
                        }
                      });
                  };

                  // Finish
                  finishProgress();
                }),
            ],
          });
        }
      })

      // Error
      .catch((err) => {
        setLoadingPage(false);
        console.error(err);
        alert(err.message, 'New Account Email Error');
      });
  };

  // Load emails, phones, and more...
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
      <center className="very-small p-3 border-bottom border-bg"> No {title} found.</center>
    );

  // Complete
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
                      onClick={requestTokenProgress(
                        // Text
                        'email address',
                        'Adding new email...',
                        // Send Request
                        (value, secretCode) => mx.requestAdd3pidEmailToken(value, secretCode, 1),
                        // Get Value
                        () => newEmail,
                        // Final Confirm
                        () => ({
                          where: emails,
                          setWhere: setEmails,
                          complete: setNewEmail,
                        }),
                      )}
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

          <SettingTile
            title="Add a new phone number"
            content={
              <SettingsText
                placeHolder="Phone number"
                value={newPhone}
                onChange={setNewPhone}
                maxLength={100}
                isPhone
                disabled
                content={
                  accountValidation.phone ? (
                    <div className="very-small text-danger">
                      <span className="phone">{accountValidation.phone}</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      disabled={typeof newPhone !== 'string' || newPhone.length < 1}
                      onClick={() => {
                        // mx.requestAdd3pidMsisdnToken();
                      }}
                    >
                      Add phone
                    </Button>
                  )
                }
              />
            }
          />
        </ul>
      </div>

      <div className="card">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Other Auth</li>

          {!loadingEmails ? (
            loadItemsList(othersAuth, 'auth', () => {})
          ) : (
            <SettingLoading title="Loading auth stuff..." />
          )}

          <SettingTile
            title="Why am I seeing that?"
            content={
              <div className="very-small text-gray">
                The contents of this list are not compatible to be managed. This list is only
                available for you is aware of what is running on your account.
              </div>
            }
          />
        </ul>
      </div>
    </>
  );
}

export default AccountSection;
