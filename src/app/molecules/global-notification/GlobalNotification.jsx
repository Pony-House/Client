import React from 'react';

import initMatrix from '../../../client/initMatrix';
import { openReusableContextMenu } from '../../../client/action/navigation';
import { getEventCords } from '../../../util/common';

import Button from '../../atoms/button/Button';
import SettingTile from '../setting-tile/SettingTile';

import NotificationSelector from './NotificationSelector';

import { useAccountData } from '../../hooks/useAccountData';

export const notifType = {
  ON: 'on',
  OFF: 'off',
  NOISY: 'noisy',
};
export const typeToLabel = {
  [notifType.ON]: 'On',
  [notifType.OFF]: 'Off',
  [notifType.NOISY]: 'Noisy',
};
Object.freeze(notifType);

const DM = '.m.rule.room_one_to_one';
const ENC_DM = '.m.rule.encrypted_room_one_to_one';
const ROOM = '.m.rule.message';
const ENC_ROOM = '.m.rule.encrypted';
const CALL = '.m.rule.call';
const CALL2 = '.org.matrix.msc3914.rule.room.call';
const JITSI = '.im.vector.jitsi';

export function getActionType(rule) {
  const { actions } = rule;
  if (actions.find((action) => action?.set_tweak === 'sound')) return notifType.NOISY;
  if (actions.find((action) => action?.set_tweak === 'highlight')) return notifType.ON;
  if (actions.find((action) => action === 'dont_notify')) return notifType.OFF;
  return notifType.OFF;
}

export function getTypeActions(type, highlightValue = false) {
  if (type === notifType.OFF) return ['dont_notify'];

  const highlight = { set_tweak: 'highlight' };
  if (typeof highlightValue === 'boolean') highlight.value = highlightValue;
  if (type === notifType.ON) return ['notify', highlight];

  const sound = { set_tweak: 'sound', value: 'default' };
  return ['notify', sound, highlight];
}

function useGlobalNotif() {
  const mx = initMatrix.matrixClient;
  const pushRules = useAccountData('m.push_rules')?.getContent();
  const underride = pushRules?.global?.underride ?? [];
  const rulesToType = {
    [DM]: notifType.ON,
    [ENC_DM]: notifType.ON,
    [ROOM]: notifType.NOISY,
    [ENC_ROOM]: notifType.NOISY,
    [CALL]: notifType.NOISY,
    [CALL2]: notifType.NOISY,
    [JITSI]: notifType.NOISY,
  };

  const getRuleCondition = (rule) => {
    const condition = [];
    if (rule === DM || rule === ENC_DM) {
      condition.push({ kind: 'room_member_count', is: '2' });
    }
    condition.push({
      kind: 'event_match',
      key: 'type',
      pattern: [ENC_DM, ENC_ROOM].includes(rule) ? 'm.room.encrypted' : 'm.room.message',
    });
    return condition;
  };

  const setRule = (rule, type) => {
    const content = pushRules ?? {};
    if (!content.global) content.global = {};
    if (!content.global.underride) content.global.underride = [];
    const ur = content.global.underride;
    let ruleContent = ur.find((action) => action?.rule_id === rule);
    if (!ruleContent) {
      ruleContent = {
        conditions: getRuleCondition(type),
        actions: [],
        rule_id: rule,
        default: true,
        enabled: true,
      };
      ur.push(ruleContent);
    }
    ruleContent.actions = getTypeActions(type);

    mx.setAccountData('m.push_rules', content);
  };

  const dmRule = underride.find((rule) => rule.rule_id === DM);
  const encDmRule = underride.find((rule) => rule.rule_id === ENC_DM);
  const roomRule = underride.find((rule) => rule.rule_id === ROOM);
  const encRoomRule = underride.find((rule) => rule.rule_id === ENC_ROOM);
  const callRule = underride.find((rule) => rule.rule_id === CALL);
  const callRule2 = underride.find((rule) => rule.rule_id === CALL2);
  const jitsiRule = underride.find((rule) => rule.rule_id === JITSI);

  if (dmRule) rulesToType[DM] = getActionType(dmRule);
  if (encDmRule) rulesToType[ENC_DM] = getActionType(encDmRule);
  if (roomRule) rulesToType[ROOM] = getActionType(roomRule);
  if (encRoomRule) rulesToType[ENC_ROOM] = getActionType(encRoomRule);
  if (callRule) rulesToType[CALL] = getActionType(callRule);
  if (callRule2) rulesToType[CALL2] = getActionType(callRule2);
  if (jitsiRule) rulesToType[JITSI] = getActionType(jitsiRule);

  return [rulesToType, setRule];
}

function GlobalNotification() {
  const [rulesToType, setRule] = useGlobalNotif();

  const onSelect = (evt, rule) => {
    openReusableContextMenu('bottom', getEventCords(evt, '.btn-link'), (requestClose) => (
      <NotificationSelector
        value={rulesToType[rule]}
        onSelect={(value) => {
          if (rulesToType[rule] !== value) setRule(rule, value);
          requestClose();
        }}
      />
    ));
  };

  return (
    <>
      <div className="card noselect mt-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Global Notifications</li>

          <SettingTile
            title="Direct messages"
            options={
              <Button onClick={(evt) => onSelect(evt, DM)} faSrc="fa-solid fa-check">
                {typeToLabel[rulesToType[DM]]}
              </Button>
            }
            content={
              <div className="very-small text-gray">
                Default notification settings for all direct message.
              </div>
            }
          />

          <SettingTile
            title="Encrypted direct messages"
            options={
              <Button onClick={(evt) => onSelect(evt, ENC_DM)} faSrc="fa-solid fa-check">
                {typeToLabel[rulesToType[ENC_DM]]}
              </Button>
            }
            content={
              <div className="very-small text-gray">
                Default notification settings for all encrypted direct message.
              </div>
            }
          />

          <SettingTile
            title="Rooms messages"
            options={
              <Button onClick={(evt) => onSelect(evt, ROOM)} faSrc="fa-solid fa-check">
                {typeToLabel[rulesToType[ROOM]]}
              </Button>
            }
            content={
              <div className="very-small text-gray">
                Default notification settings for all room message.
              </div>
            }
          />

          <SettingTile
            title="Encrypted rooms messages"
            options={
              <Button onClick={(evt) => onSelect(evt, ENC_ROOM)} faSrc="fa-solid fa-check">
                {typeToLabel[rulesToType[ENC_ROOM]]}
              </Button>
            }
            content={
              <div className="very-small text-gray">
                Default notification settings for all encrypted room message.
              </div>
            }
          />
        </ul>
      </div>

      <div className="card noselect mt-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Global Call Notifications</li>

          <SettingTile
            title="Room"
            options={
              <Button onClick={(evt) => onSelect(evt, CALL)} faSrc="fa-solid fa-check">
                {typeToLabel[rulesToType[CALL]]}
              </Button>
            }
            content={
              <div className="very-small text-gray">
                Default notification settings for all room call.
              </div>
            }
          />

          <SettingTile
            title="org.matrix.msc3914.rule.room.call"
            options={
              <Button onClick={(evt) => onSelect(evt, CALL2)} faSrc="fa-solid fa-check">
                {typeToLabel[rulesToType[CALL2]]}
              </Button>
            }
            content={
              <div className="very-small text-gray">
                Default notification settings for all org.matrix.msc3914.rule.room.call.
              </div>
            }
          />

          <SettingTile
            title="Jitsi widget"
            options={
              <Button onClick={(evt) => onSelect(evt, JITSI)} faSrc="fa-solid fa-check">
                {typeToLabel[rulesToType[JITSI]]}
              </Button>
            }
            content={
              <div className="very-small text-gray">
                Default notification settings for all jitsi widgets.
              </div>
            }
          />
        </ul>
      </div>
    </>
  );
}

export default GlobalNotification;
