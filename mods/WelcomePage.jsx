import React from 'react';
import PropTypes from 'prop-types';

import Button from '@src/app/atoms/button/Button';
import AuthDivBase from '@src/app/templates/auth/modules/AuthDivBase';
import Img from '@src/app/atoms/image/Image';

/*
    If you want to create a custom welcome page, then edit this file.
    The example will help you simply in teaching you how to position
    the components in the right way in the HTML.

    If you're looking to place custom CSS, edit the index.js file.
    Pony House is using Bootstrap CSS. That means all bootstrap components will work here.
*/

const WelcomePage = {};
WelcomePage.enabled = false;
WelcomePage.html = function ({ setIsWelcome, setType }) {
  return (
    <AuthDivBase>
      <center>
        <a href="./" target="_blank" rel="noopener">
          <Img src="./img/png/cinny-main.png" alt="logo" height={120} />
        </a>
        <h2>Welcome to demo page of pony.house!</h2>
        <div className="mb-2">
          Using a homeserver for a Matrix client is beneficial because it offers greater control
          over data privacy and security. It allows you to manage your own server, ensuring that
          your communication data is not stored or processed by third parties. Additionally, a
          homeserver provides better customization options, improved performance, and the ability to
          integrate with other tools and services specific to your needs. This setup enhances
          overall user experience and autonomy in managing digital communications.
        </div>
        <div className="mb-2">
          Please read <a href="/">our rules to join</a>.
        </div>

        <div className="mb-2">
          <Button
            variant="primary"
            size="lg"
            className="small m-2 px-5"
            onClick={() => {
              setType('login');
              setIsWelcome(false);
            }}
          >
            <i class="fa-solid fa-right-to-bracket me-1" /> Sign In
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="small m-2 px-5"
            onClick={() => {
              setType('register');
              setIsWelcome(false);
            }}
          >
            <i class="fa-solid fa-circle-plus me-1" /> Create Account
          </Button>
        </div>
      </center>

      <div class="px-5">
        <ul>
          <li>
            <a href="./">Our server-wide rules and privacy info</a>
          </li>
          <li>
            <a href="./">Learn how to connect on desktop and mobile apps</a>
          </li>
          <li>
            <a href="./">Contact me</a>
          </li>
        </ul>
      </div>
    </AuthDivBase>
  );
};

WelcomePage.html.propTypes = {
  setIsWelcome: PropTypes.func,
  setType: PropTypes.func,
};

export default WelcomePage;
