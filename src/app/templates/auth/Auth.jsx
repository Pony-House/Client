import React, { useState, useEffect } from 'react';

import * as auth from '../../../client/action/auth';
import cons from '../../../client/state/cons';
import { getUrlPrams } from '../../../util/common';

import Text from '../../atoms/text/Text';
import ScrollView from '../../atoms/scroll/ScrollView';
import { Header } from '../../atoms/header/Header';
import Avatar from '../../atoms/avatar/Avatar';

import LoadingScreen from './modules/LoadingScreen';
import AuthCard from './modules/AuthCard';

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
    <ScrollView invisible>
      <div className="auth__base puddy_background">
        <div className="auth__wrapper">
          {loginToken && <LoadingScreen message="Redirecting..." />}
          {!loginToken && (
            <div className="auth-card">
              <Header>
                <Avatar size="extra-small" imageSrc="./favicon.ico" />
                <Text variant="h2" weight="medium">Pony House</Text>
              </Header>
              <div className="auth-card__content">
                <AuthCard />
              </div>
            </div>
          )}
        </div>

        <div className="auth-footer">
          <Text variant="b2">
            <a href="https://cinny.in" target="_blank" rel="noreferrer">About</a>
          </Text>
          <Text variant="b2">
            <a href="https://github.com/Pony-House/Client/releases" target="_blank" rel="noreferrer">{`v${cons.version}`}</a>
          </Text>
          <Text variant="b2">
            <a href="https://twitter.com/JasminDreasond" target="_blank" rel="noreferrer">Twitter</a>
          </Text>
          <Text variant="b2">
            <a href="https://matrix.org" target="_blank" rel="noreferrer">Powered by Matrix</a>
          </Text>
        </div>
      </div>
    </ScrollView>
  );
}

export default Auth;
