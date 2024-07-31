import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import WelcomePage from '@mods/WelcomePage';
import storageManager from '@src/util/libs/Localstorage';

import * as auth from '../../../client/action/auth';
import cons from '../../../client/state/cons';
import { getUrlParams } from '../../../util/common';
import Avatar from '../../atoms/avatar/Avatar';

import LoadingScreen from './modules/LoadingScreen';
import AuthCard from './modules/AuthCard';
import ElectronSidebar from '../client/ElectronSidebar';
import { AuthDivBaseWithBanner } from './modules/AuthDivBase';
import LoadingPage from '../client/Loading';

function Auth({ isDevToolsOpen = false }) {
  const [loginToken, setLoginToken] = useState(getUrlParams('loginToken'));
  const [type, setType] = useState('login');
  const [isWelcome, setIsWelcome] = useState(WelcomePage.enabled);

  useEffect(() => {
    const authSync = async () => {
      if (!loginToken) return;
      if (storageManager.getItem(cons.secretKey.BASE_URL) === undefined) {
        setLoginToken(null);
        return;
      }
      const baseUrl = storageManager.getItem(cons.secretKey.BASE_URL);
      try {
        await auth.loginWithToken(baseUrl, loginToken);

        const { href } = window.location;
        window.location.replace(href.slice(0, href.indexOf('?')));
      } catch {
        setLoginToken(null);
      }
    };

    authSync();
  }, []);

  const showLoginPage = !isWelcome || !WelcomePage.html || loginToken;
  return (
    <>
      <ElectronSidebar isDevToolsOpen={isDevToolsOpen} />
      <LoadingPage />
      <section className={`vh-100 auth-base${isDevToolsOpen ? ' devtools-open' : ''}`}>
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className={`col col-xl-10 tiny-box${showLoginPage ? ' tiny-box-login' : ''}`}>
              <div className="card">
                <div className="row g-0">
                  {showLoginPage ? (
                    <AuthDivBaseWithBanner>
                      {loginToken && <LoadingScreen message="Redirecting..." />}
                      {!loginToken && (
                        <>
                          <div className="d-flex align-items-center mb-3 pb-1 noselect">
                            <Avatar imageSrc="./img/png/cinny-main.png" />
                            <span className="ms-3 h2 fw-bold mb-0">{__ENV_APP__.INFO.name}</span>
                          </div>

                          <AuthCard type={type} setType={setType} />
                        </>
                      )}

                      <section className="border-top border-bg py-4 footer noselect">
                        <div className="row text-center d-flex justify-content-center">
                          <div className="col-md-4 small">
                            <a
                              href="https://github.com/Pony-House/Client/releases"
                              rel="noreferrer"
                              className="text-bg-force"
                              target="_blank"
                            >{`Version ${cons.version}`}</a>
                          </div>

                          <div className="col-md-4 small">
                            <a
                              href="https://twitter.com/JasminDreasond"
                              target="_blank"
                              rel="noreferrer"
                              className="text-bg-force"
                            >
                              Twitter
                            </a>
                          </div>

                          <div className="col-md-4 small">
                            <a
                              href="https://matrix.org"
                              target="_blank"
                              rel="noreferrer"
                              className="text-bg-force"
                            >
                              Powered by Matrix
                            </a>
                          </div>
                        </div>
                      </section>
                    </AuthDivBaseWithBanner>
                  ) : (
                    <WelcomePage.html setIsWelcome={setIsWelcome} setType={setType} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

Auth.propTypes = {
  isDevToolsOpen: PropTypes.bool,
};

export default Auth;
