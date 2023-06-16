import React from 'react';

import Text from '../../atoms/text/Text';


function Welcome() {
  return (
    <div className="tiny-welcome p-3 border-0 rounded d-flex justify-content-center w-100 h-100 noselect" style={{ alignItems: 'center' }}>
      <center>
        <img className="app-welcome__logo noselect" src="./public/favicon.ico" alt="Cinny logo" />

        <h2>Welcome to Pony House</h2>

        <h6>The tiny Pony House matrix client</h6>

      </center>
    </div>
  );
}

export default Welcome;
