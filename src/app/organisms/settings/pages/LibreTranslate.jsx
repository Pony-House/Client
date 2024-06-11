import React, { useState } from 'react';
import libreTranslate from '@src/util/libs/libreTranslate';

import SettingTile from '../../../molecules/setting-tile/SettingTile';
import Toggle from '../../../atoms/button/Toggle';
import { toggleActionLocal } from '../Api';
import SegmentedControls from '@src/app/atoms/segmented-controls/SegmentedControls';

function LibreTranslateSection() {
  const [isEnabled, setIsEnabled] = useState(libreTranslate.get('enabled'));
  const [host, setHost] = useState(libreTranslate.get('host'));
  const [apiKey, setApiKey] = useState(libreTranslate.get('apiKey'));

  const [source, setSource] = useState(libreTranslate.get('source'));
  const [target, setTarget] = useState(libreTranslate.get('target'));

  const [langs, setLangs] = useState([]);

  const toggleAppearanceAction = (where, setData) => (data) => {
    setData(data);
    libreTranslate.set(where, data);
  };

  // Complete Render
  return (
    <>
      <div className="card noselect mb-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Feature</li>

          <SettingTile
            title="Enabled"
            options={
              <Toggle
                className="d-inline-flex"
                isActive={isEnabled}
                onToggle={toggleAppearanceAction('enabled', setIsEnabled)}
              />
            }
            content={
              <div className="very-small text-gray">
                Activate all Libre Translation resources at {__ENV_APP__.INFO.name}.
              </div>
            }
          />

          <SettingTile
            title="Source"
            content={
              <div className="mt-2">
                <SegmentedControls
                  type="select"
                  selected={typeof source === 'string' ? langs.indexOf(source) : -1}
                  segments={langs}
                  onSelect={(index) => {
                    const value = Number(index);
                    libreTranslate.set('source', langs[index]);
                    setSource(langs[index]);
                  }}
                />
              </div>
            }
          />

          <SettingTile
            title="Target"
            content={
              <div className="mt-2">
                <SegmentedControls
                  type="select"
                  selected={typeof target === 'string' ? langs.indexOf(target) : -1}
                  segments={langs}
                  onSelect={(index) => {
                    const value = Number(index);
                    libreTranslate.set('target', langs[index]);
                    setTarget(langs[index]);
                  }}
                />
              </div>
            }
          />
        </ul>
      </div>

      <div className="card">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Credits</li>

          <li className="list-group-item border-0">
            <img
              src="./img/icon/libre-translate.ico"
              className="logo-white-bg mb-1"
              alt="libre-translate-logo"
              draggable={false}
            />
            <div className="small">
              This software is not directly installed at Pony House. This is a third-party service
              with a connected API that will only be executed when you request execution. If you are
              an advanced user, you can use your own LibreTranslate self-host to increase your
              privacy. Enable advanced user settings to change the host used by{' '}
              {__ENV_APP__.INFO.name}.
            </div>
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
