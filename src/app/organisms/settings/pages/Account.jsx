import React, { useEffect, useRef, useState } from 'react';
import { objType } from 'for-promise/utils/lib.mjs';

import userPid from '@src/util/libs/userPid';
import { registerValidator } from '@src/util/register';

import SettingTile from '@src/app/molecules/setting-tile/SettingTile';
import SettingsText from '@src/app/molecules/settings-text/SettingsText';

import moment, { momentFormat } from '@src/util/libs/momentjs';
import { btModal, tinyConfirm } from '@src/util/tools';

import Checkbox from '@src/app/atoms/button/Checkbox';
import Button from '@src/app/atoms/button/Button';
import IconButton from '@src/app/atoms/button/IconButton';

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

  const [logoutDevices, setLogoutDevices] = useState(false);
  const [bind] = useState(false);

  // Items list
  const [emails, setEmails] = useState(null);
  const [phones, setPhones] = useState(null);
  const [othersAuth, setOthersAuth] = useState(null);

  const submitEmail = useRef(null);
  const submitPhone = useRef(null);

  const submitNewPassword = useRef(null);
  const submitNewPassword2 = useRef(null);
  const submitPassword = useRef(null);

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
    const tinyValue = value();
    if (typeof tinyValue === 'string' && tinyValue.length > 0) {
      setLoadingPage(loadingTitle);
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
              $('<h6>').text(`The request to add a new ${type} was successfully sent!`),
            ];

            body.push(
              $('<span>', { class: 'small' }).text(
                `Confirm the inclusion of this ${type} to prove your identity.`,
              ),
            );

            body.push($('<br>'));
            body.push($('<strong>', { class: 'very-small' }).text(`Session Id: ${result.sid}`));

            // Send modal
            tinyModal = btModal({
              title: `Adding a new ${type}`,
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
                  .text('Continue')
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
                        alert(
                          `Your ${type} has been successfully verified!`,
                          'Session Verification',
                        );
                      };

                      initMatrix.matrixClient[threePidAction](threePidOptions)
                        .then(sessionComplete)

                        // Error Session
                        .catch((err) => {
                          if (
                            !bind &&
                            objType(err.data, 'object') &&
                            Array.isArray(err.data.flows)
                          ) {
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

                            // Use SSO
                            /* else if (canSSO) {
                              threePidOptions.auth = {
                                type: 'm.login.token',
                                token: '',
                              };
  
                              // Last try
                              initMatrix.matrixClient[threePidAction](threePidOptions)
                                .then(sessionComplete)
                                .catch(sessionError);
                            }*/

                            // Nothing
                            else {
                              sessionError(err);
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
    }
  };

  // Load emails, phones, and more...
  const loadItemsList = (where, setWhere, title, medium) =>
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
              onClick={async () => {
                const isConfirmed = await tinyConfirm(
                  `Are you sure? This decision is inreversible!\n${email.address}`,
                  `Removing ${title}`,
                );
                if (isConfirmed) {
                  setLoadingPage(`Removing ${title}...`);
                  return initMatrix.matrixClient
                    .deleteThreePid(medium, email.address)
                    .then((result) => {
                      /* if (
                        objType(result, 'object') &&
                        typeof result.id_server_unbind_result === 'string' &&
                        result.id_server_unbind_result === 'success'
                      ) { */
                      const tinyIndex = where.findIndex((item) => item.address);
                      if (tinyIndex > -1) where.splice(tinyIndex, 1);
                      alert(`Your ${title} was successfully removed.`, 'Complete!');
                      if (tinyIndex > -1) setWhere(where);
                      // } else alert(`It was not possible to remove your ${title}.`, 'Error!');
                      setLoadingPage(false);
                    })
                    .catch((err) => {
                      console.error(err);
                      alert(err.message, 'Remove ThreePid Error');
                      setLoadingPage(false);
                    });
                }
              }}
              fa="fa-solid fa-trash-can"
              tooltip={`Remove ${title}`}
            />
          }
          content={
            <>
              {typeof email.added_at === 'number' &&
                (typeof email.validated_at !== 'number' ||
                  email.added_at !== email.validated_at) && (
                  <div className="very-small text-gray">
                    Added at
                    <span style={{ color: 'var(--tc-surface-normal)' }}>
                      {moment(email.added_at).format(
                        ` ${momentFormat.clock2()}, ${momentFormat.calendar()}`,
                      )}
                    </span>
                  </div>
                )}

              {typeof email.validated_at === 'number' && (
                <div className="very-small text-gray">
                  Validated at
                  <span style={{ color: 'var(--tc-surface-normal)' }}>
                    {moment(email.validated_at).format(
                      ` ${momentFormat.clock2()}, ${momentFormat.calendar()}`,
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

  const updateValue =
    (callback, refItem, err = null) =>
    (value, target, el, method) => {
      callback(value);
      if (method.isEnter && !err) {
        $(refItem.current).focus();
      }
    };

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
                  ref={submitNewPassword}
                  placeHolder="New password"
                  value={newPassword}
                  onChange={updateValue(setNewPassword, newPassword2, accountValidation.password)}
                  maxLength={100}
                  isPassword
                />
                <SettingsText
                  ref={submitNewPassword2}
                  placeHolder="Confirm the new password"
                  value={newPassword2}
                  onChange={updateValue(
                    setNewPassword2,
                    submitPassword,
                    accountValidation.confirmPassword,
                  )}
                  maxLength={100}
                  isPassword
                  content={
                    <>
                      <div className="d-flex mb-1">
                        <Checkbox isActive={logoutDevices} onToggle={setLogoutDevices} />
                        <div className="small ms-2">Disconnect all other devices.</div>
                      </div>
                      {accountValidation.password || accountValidation.confirmPassword ? (
                        <div className="very-small text-danger">
                          {!accountValidation.confirmPassword && accountValidation.password && (
                            <div className="password">
                              <i class="fa-solid fa-triangle-exclamation me-1" />
                              {accountValidation.password}
                            </div>
                          )}
                          {accountValidation.confirmPassword && (
                            <div className="confirmPassword">
                              <i class="fa-solid fa-triangle-exclamation me-1" />
                              {accountValidation.confirmPassword}
                            </div>
                          )}
                        </div>
                      ) : null}
                      <Button
                        ref={submitPassword}
                        variant="primary"
                        disabled={
                          newPassword.length < 1 ||
                          newPassword2.length < 1 ||
                          accountValidation.password ||
                          accountValidation.confirmPassword
                        }
                        onClick={() => {
                          setLoadingPage('Changing password...');
                          initMatrix.matrixClient
                            .setPassword(
                              {
                                type: 'm.login.password',
                                identifier: {
                                  type: 'm.id.user',
                                  user: initMatrix.matrixClient
                                    .getUserId()
                                    .split(':')[0]
                                    .substring(1),
                                },
                                password: currentPassword,
                              },
                              newPassword,
                              logoutDevices,
                            )
                            .then(() => {
                              setCurrentPassword('');
                              setNewPassword('');
                              setNewPassword2('');
                              setLoadingPage(false);
                              alert(`You successfully changed your password!`, 'Change Password');
                            })
                            .catch((err) => {
                              console.error(err);
                              setNewPassword2('');
                              alert(err.message, 'Change Password Error');
                            });
                        }}
                      >
                        Change Password
                      </Button>
                    </>
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
            loadItemsList(emails, setEmails, 'email', 'email')
          ) : (
            <SettingLoading title="Loading emails..." />
          )}

          <SettingTile
            title="Add a new account email"
            content={
              <SettingsText
                placeHolder="Email address"
                value={newEmail}
                onChange={updateValue(setNewEmail, submitEmail, accountValidation.email)}
                maxLength={100}
                isEmail
                content={
                  <>
                    {accountValidation.email ? (
                      <div className="very-small text-danger mb-1">
                        <span className="email">
                          <i class="fa-solid fa-triangle-exclamation me-1" />
                          {accountValidation.email}
                        </span>
                      </div>
                    ) : null}
                    <Button
                      ref={submitEmail}
                      variant="primary"
                      disabled={
                        typeof newEmail !== 'string' ||
                        newEmail.length < 1 ||
                        accountValidation.email
                      }
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
                  </>
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
            loadItemsList(phones, setPhones, 'phone number', 'msisdn')
          ) : (
            <SettingLoading title="Loading phone numbers..." />
          )}

          <SettingTile
            title="Add a new phone number"
            content={
              <SettingsText
                placeHolder="Phone number"
                value={newPhone}
                onChange={updateValue(setNewPhone, submitPhone, accountValidation.phone)}
                maxLength={100}
                isPhone
                disabled
                content={
                  <>
                    {accountValidation.phone ? (
                      <div className="very-small text-danger mb-1">
                        <span className="phone">{accountValidation.phone}</span>
                      </div>
                    ) : null}
                    <Button
                      ref={submitPhone}
                      variant="primary"
                      disabled
                      onClick={() => {
                        // mx.requestAdd3pidMsisdnToken();
                      }}
                    >
                      Add phone
                    </Button>
                  </>
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
            loadItemsList(othersAuth, setOthersAuth, 'auth', null)
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
