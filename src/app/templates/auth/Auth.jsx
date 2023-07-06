import React, { useState, useEffect, useRef } from 'react';

import { Formik } from 'formik';

import * as auth from '../../../client/action/auth';
import cons from '../../../client/state/cons';
import { Debounce, getUrlPrams } from '../../../util/common';
import { getBaseUrl } from '../../../util/matrixUtil';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import IconButton from '../../atoms/button/IconButton';
import Input from '../../atoms/input/Input';
import Spinner from '../../atoms/spinner/Spinner';
import ScrollView from '../../atoms/scroll/ScrollView';
import { Header } from '../../atoms/header/Header';
import Avatar from '../../atoms/avatar/Avatar';
import ContextMenu, { MenuItem, MenuHeader } from '../../atoms/context-menu/ContextMenu';

import SSOButtons from '../../molecules/sso-buttons/SSOButtons';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const BAD_EMAIL_ERROR = 'Invalid email address';

function isValidInput(value, regex) {
  if (typeof regex === 'string') return regex === value;
  return regex.test(value);
}
function normalizeUsername(rawUsername) {
  const noLeadingAt = rawUsername.indexOf('@') === 0 ? rawUsername.substr(1) : rawUsername;
  return noLeadingAt.trim();
}

function Auth() {
  const [loginToken, setLoginToken] = useState(getUrlPrams('loginToken'));

  useEffect(async () => {
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
  }, []);

  return (
    <ScrollView invisible>
      <div className="auth__base puddy_background">
        <div className="auth__wrapper">
          {loginToken && <LoadingScreen message="Redirecting..." />}
          {!loginToken && (
            <div className="auth-card">
              <Header>
                <Avatar size="extra-small" imageSrc="./public/favicon.ico" />
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
