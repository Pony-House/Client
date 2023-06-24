import React from 'react';

function Welcome() {
  return (
    <div className="tiny-welcome p-3 border-0 rounded d-flex justify-content-center w-100 h-100 noselect" style={{ alignItems: 'center' }}>
      <center>
        <img className="app-welcome__logo noselect" src="./public/favicon.ico" alt="Cinny logo" />

        <h2 className='mt-3'>Welcome to Pony House</h2>

        <h6>The open source house, your house, the house for all matrix ponies</h6>

      </center>
    </div>
  );
}

export default Welcome;
