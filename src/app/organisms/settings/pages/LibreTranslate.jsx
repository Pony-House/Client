import React, { useState, useEffect, useRef } from 'react';

import SettingTile from '../../../molecules/setting-tile/SettingTile';
import Toggle from '../../../atoms/button/Toggle';
import { toggleActionLocal } from '../Api';

function LibreTranslateSection() {
  // Effects
  useEffect(() => {
    // Complete
    return () => {};
  });

  // Complete Render
  return (
    <>
      <div className="card">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Credits</li>

          <li className="list-group-item border-0">
            <img
              src="./img/icon/libre-translate.ico"
              className="logo-white-bg mb-1"
              alt="libre-translate-logo"
            />
            <div className="small">
              The{' '}
              <a
                href="https://github.com/LibreTranslate/LibreTranslate"
                rel="noreferrer noopener"
                target="_blank"
              >
                Libre Translate
              </a>{' '}
              is used under the terms of{' '}
              <a
                href="https://www.gnu.org/licenses/agpl-3.0.en.html"
                rel="noreferrer noopener"
                target="_blank"
              >
                AGPL-3.0
              </a>
              .
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}

export default LibreTranslateSection;
