import React from 'react';

import { openReusableDialog } from '../../client/action/navigation';

import Text from '../../app/atoms/text/Text';
import SettingTile from '../../app/molecules/setting-tile/SettingTile';

import rommCommands from './room';
import userCommands from './user';
import messageCommands from './message';

const MXID_REG = /^@\S+:\S+$/;
const ROOM_ID_ALIAS_REG = /^(#|!)\S+:\S+$/;
const ROOM_ID_REG = /^!\S+:\S+$/;
const MXC_REG = /^mxc:\/\/\S+$/;

export { MXID_REG, ROOM_ID_ALIAS_REG, ROOM_ID_REG, MXC_REG };

export function processMxidAndReason(data) {
  let reason;
  let idData = data;
  const reasonMatch = data.match(/\s-r\s/);
  if (reasonMatch) {
    idData = data.slice(0, reasonMatch.index);
    reason = data.slice(reasonMatch.index + reasonMatch[0].length);
    if (reason.trim() === '') reason = undefined;
  }
  const rawIds = idData.split(' ');
  const userIds = rawIds.filter((id) => id.match(MXID_REG));
  return {
    userIds,
    reason,
  };
}

const commands = {
  help: {
    category: 'default',
    name: 'help',
    description: 'View all commands',
    // eslint-disable-next-line no-use-before-define
    exe: () => openHelpDialog(),
  },
};

const importDefaultCommands = (items) => {
  for (const item in items) {
    commands[item] = items[item];
  }
};

importDefaultCommands(rommCommands);
importDefaultCommands(userCommands);
importDefaultCommands(messageCommands);

export function addCommand(name, newCommand) {
  commands[name] = newCommand;
}

export function removeCommand(name) {
  delete commands[name];
}

function openHelpDialog() {
  const comamndsList = {};
  openReusableDialog(
    <Text variant="s1" weight="medium">
      Commands
    </Text>,
    () => (
      <div className="commands-dialog">
        {Object.keys(commands).map((cmdName) => {
          if (!comamndsList[commands[cmdName].name]) {
            comamndsList[commands[cmdName].name] = true;

            return (
              <SettingTile
                key={cmdName}
                title={cmdName}
                content={
                  <div className="very-small text-gray">{commands[cmdName].description}</div>
                }
              />
            );
          }
        })}
      </div>
    ),
  );
}

export default commands;
