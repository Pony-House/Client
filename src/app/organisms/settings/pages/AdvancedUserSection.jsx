import React, { useState } from 'react';
import { getAppearance, toggleAppearanceAction } from '../../../../util/libs/appearance';
import SettingTile from '../../../molecules/setting-tile/SettingTile';
import Toggle from '../../../atoms/button/Toggle';

function AdvancedUserSection() {
  const appearanceSettings = getAppearance();
  const [advancedUserMode, setAdvancedUserMode] = useState(appearanceSettings.advancedUserMode);
  const [basicUserMode, setBasicUserMode] = useState(appearanceSettings.basicUserMode);

  return (
    <div>
      <div className="card noselect mt-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Main</li>

          {!basicUserMode ? (
            <SettingTile
              title="Enable advanced settings"
              options={
                <Toggle
                  className="d-inline-flex"
                  isActive={advancedUserMode}
                  onToggle={toggleAppearanceAction('advancedUserMode', setAdvancedUserMode)}
                />
              }
              content={
                <div className="very-small text-gray">
                  Enable visibility of edit settings dedicated to advanced users. This setting is
                  disabled by default to try to keep the client as simple as possible for the end
                  user.
                </div>
              }
            />
          ) : null}

          <SettingTile
            title="Settings simplification"
            options={
              <Toggle
                className="d-inline-flex"
                isActive={basicUserMode}
                onToggle={toggleAppearanceAction('basicUserMode', setBasicUserMode)}
                disabled={!basicUserMode && advancedUserMode}
              />
            }
            content={
              <div className="very-small text-gray">
                If you are feeling really lost and just want to see the basics of the settings,
                select this option.
              </div>
            }
          />
        </ul>
      </div>
    </div>
  );
}

export default AdvancedUserSection;
