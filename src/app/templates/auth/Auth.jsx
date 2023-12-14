import React, { useState, useEffect } from 'react';

import * as auth from '../../../client/action/auth';
import cons from '../../../client/state/cons';
import { getUrlPrams } from '../../../util/common';
import Avatar from '../../atoms/avatar/Avatar';

import LoadingScreen from './modules/LoadingScreen';
import AuthCard from './modules/AuthCard';
import { ENVapp } from '../../../util/tools';

function Auth() {
  const [loginToken, setLoginToken] = useState(getUrlPrams('loginToken'));

  useEffect(() => {

    const authSync = async () => {

      if (!loginToken) return;
      if (localStorage.getItem(cons.secretKey.BASE_URL) === undefined) {
        setLoginToken(null);
        return;
      }
      const baseUrl = localStorage.getItem(cons.secretKey.BASE_URL);
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

  return (
    <section className="vh-100 auth-base">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col col-xl-10 tiny-box">
            <div className="card">
              <div className="row g-0">

                <div className="col-md-6 col-lg-5 d-none d-md-block banner" />

                <div className="col-md-6 col-lg-7 d-flex align-items-center card-fullscren-base">
                  <div className="card-body p-lg-4 px-lg-5">

                    {loginToken && <LoadingScreen message="Redirecting..." />}
                    {!loginToken && (<>

                      <div className="d-flex align-items-center mb-3 pb-1">
                        <Avatar imageSrc="./img/png/cinny-main.png" />
                        <span className="ms-3 h2 fw-bold mb-0">{ENVapp.info.name}</span>
                      </div>

                      <AuthCard />

                    </>)}

                    <section className='border-top border-bg py-4 footer'>

                      <div className="row text-center d-flex justify-content-center">

                        <div className="col-md-4 small">
                          <a href="https://github.com/Pony-House/Client/releases" rel="noreferrer" className="text-bg-force" target="_blank">{`Version ${cons.version}`}</a>
                        </div>

                        <div className="col-md-4 small">
                          <a href="https://twitter.com/JasminDreasond" target="_blank" rel="noreferrer" className="text-bg-force">Twitter</a>
                        </div>

                        <div className="col-md-4 small">
                          <a href="https://matrix.org" target="_blank" rel="noreferrer" className="text-bg-force">Powered by Matrix</a>
                        </div>

                      </div>

                    </section>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Auth;
