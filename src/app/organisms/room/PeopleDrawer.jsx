import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import initMatrix from '../../../client/initMatrix';
import { getPowerLabel, getUsernameOfRoomMember } from '../../../util/matrixUtil';
import { colorMXID } from '../../../util/colorMXID';
import {
  openInviteUser,
  openProfileViewer,
  openReusableContextMenu,
} from '../../../client/action/navigation';
import AsyncSearch from '../../../util/AsyncSearch';
import { memberByStatus, memberByPowerLevel } from '../../../util/sort';

import Text from '../../atoms/text/Text';
import { Header } from '../../atoms/header/Header';
import IconButton from '../../atoms/button/IconButton';
import Button from '../../atoms/button/Button';
import Input from '../../atoms/input/Input';
import SegmentedControl from '../../atoms/segmented-controls/SegmentedControls';
import PeopleSelector from '../../molecules/people-selector/PeopleSelector';
import PeopleSelectorBanner from '../../molecules/people-selector/PeopleSelectorBanner';
import tinyAPI from '../../../util/mods';

import { getEventCords } from '../../../util/common';
import UserOptions from '../../molecules/user-options/UserOptions';

function simplyfiMembers(members) {
  const mx = initMatrix.matrixClient;
  return members.map((member) => ({
    user: mx.getUser(member.userId),
    userId: member.userId,
    name: getUsernameOfRoomMember(member),
    username: member.userId.slice(1, member.userId.indexOf(':')),
    avatarSrc: member.getAvatarUrl(mx.baseUrl, 32, 32, 'crop'),
    peopleRole: getPowerLabel(member.powerLevel),
    powerLevel: members.powerLevel,
  }));
}

const asyncSearch = new AsyncSearch();
function PeopleDrawer({ roomId, isUserList, setIsUserList }) {
  const PER_PAGE_MEMBER = 50;
  const mx = initMatrix.matrixClient;
  const { directs } = initMatrix.roomList;

  const room = mx.getRoom(roomId);
  const canInvite = room?.canInvite(mx.getUserId());
  const isDM = directs.has(roomId);

  const newValues = [
    { name: 'Joined', value: 'join' },
    { name: 'Invited', value: 'invite' },
    { name: 'Banned', value: 'ban' },
  ];

  const usersCount = room.getJoinedMemberCount();

  tinyAPI.emit('roomMembersOptions', newValues, isUserList);
  const defaultMembership = newValues.find((item) => item.value === 'join');

  const [itemCount, setItemCount] = useState(PER_PAGE_MEMBER);
  const [membership, setMembership] = useState(defaultMembership);
  const [memberList, setMemberList] = useState([]);
  const [searchedMembers, setSearchedMembers] = useState(null);
  const searchRef = useRef(null);

  const newIsUserList = !isDM || usersCount !== 2 || membership.value !== 'join';
  if (isUserList !== newIsUserList) setIsUserList(newIsUserList);

  const getMembersWithMembership = useCallback(
    (mship) => room.getMembersWithMembership(mship),
    [roomId, membership.value],
  );

  function loadMorePeople() {
    setItemCount(itemCount + PER_PAGE_MEMBER);
  }

  function handleSearchData(data) {
    // NOTICE: data is passed as object property
    // because react sucks at handling state update with array.
    setSearchedMembers({ data });
    setItemCount(PER_PAGE_MEMBER);
  }

  function handleSearch(e) {
    const term = e.target.value;
    if ((searchRef.current && term === '') || term === undefined) {
      searchRef.current.value = '';
      searchRef.current.focus();
      setSearchedMembers(null);
      setItemCount(PER_PAGE_MEMBER);
    } else asyncSearch.search(term);
  }

  useEffect(() => {
    asyncSearch.setup(memberList, {
      keys: ['name', 'username', 'userId'],
      limit: PER_PAGE_MEMBER,
    });
  }, [memberList]);

  useEffect(() => {
    let isLoadingMembers = false;
    let isRoomChanged = false;

    const updateMemberList = (event) => {
      if (isLoadingMembers) return;
      if (event && event?.getRoomId() !== roomId) return;

      // Default
      if (!Array.isArray(membership.custom)) {
        const membersWithMembership = getMembersWithMembership(membership.value);
        let membersData = [];

        if (membersWithMembership.length > 1000) {
          for (const item in membersWithMembership) {
            const user = mx.getUser(membersWithMembership[item].userId);
            if (user && user?.presence === 'online') {
              membersData.push(membersWithMembership[item]);
            }
          }

          membersData.sort(memberByPowerLevel);
        } else {
          membersWithMembership.sort(memberByStatus).sort(memberByPowerLevel);
          membersData = membersWithMembership;
        }

        setMemberList(simplyfiMembers(membersData));
      }

      // Custom
      else setMemberList(membership.custom);
    };

    if (searchRef.current) searchRef.current.value = '';
    updateMemberList();
    isLoadingMembers = true;
    room.loadMembersIfNeeded().then(() => {
      isLoadingMembers = false;
      if (isRoomChanged) return;
      updateMemberList();
    });

    asyncSearch.on(asyncSearch.RESULT_SENT, handleSearchData);
    mx.on('RoomMember.membership', updateMemberList);
    mx.on('RoomMember.powerLevel', updateMemberList);
    mx.on('RoomMember.user', updateMemberList);

    return () => {
      isRoomChanged = true;
      setMemberList([]);
      setSearchedMembers(null);
      setItemCount(PER_PAGE_MEMBER);
      asyncSearch.removeListener(asyncSearch.RESULT_SENT, handleSearchData);
      mx.removeListener('RoomMember.membership', updateMemberList);
      mx.removeListener('RoomMember.powerLevel', updateMemberList);
      mx.removeListener('RoomMember.user', updateMemberList);
    };
  }, [roomId, membership]);

  useEffect(() => {
    setMembership(defaultMembership);
  }, [roomId]);

  const segments = [];
  const segmentsIndex = {};
  const selectMembership = [];

  let segmentIndexCounter = 0;
  for (const item in newValues) {
    const vl = newValues[item];
    if (typeof vl.name === 'string' && typeof vl.value === 'string') {
      segments.push({ text: vl.name });
      selectMembership.push(() => setMembership(vl));

      segmentsIndex[vl.value] = segmentIndexCounter;
      segmentIndexCounter++;
    }
  }

  const mList = searchedMembers !== null ? searchedMembers.data : memberList.slice(0, itemCount);
  tinyAPI.emit('roomSearchedMembers', mList);

  return (
    <div className={`people-drawer${!isUserList ? ' people-drawer-banner' : ''}`}>
      <Header>
        <ul className="navbar-nav mr-auto pb-1">
          {isUserList ? (
            <li className="nav-item ps-2">
              People
              <div className="very-small text-gray">{`${usersCount} members`}</div>
            </li>
          ) : (
            <li className="nav-item ps-2">
              User Room
              <div className="very-small text-gray">The user private room</div>
            </li>
          )}
        </ul>

        <ul className="navbar-nav ms-auto mb-0 small">
          <li className="nav-item">
            <IconButton
              onClick={() => openInviteUser(roomId)}
              tooltipPlacement="bottom"
              tooltip="Invite"
              fa="fa-solid fa-user-plus"
              disabled={!canInvite}
            />
          </li>
        </ul>
      </Header>

      <div className={`people-drawer__content-wrapper people-drawer-select-${membership.value}`}>
        <center
          className={`${isUserList ? 'p-3 ' : ''} w-100`}
          style={{
            height: '100%',
            overflowY: 'auto',
          }}
        >
          {isUserList ? (
            <SegmentedControl
              className="pb-3"
              selected={(() => {
                const getSegmentIndex = segmentsIndex;
                return getSegmentIndex[membership.value];
              })()}
              segments={segments}
              onSelect={(index) => {
                const selectSegment = selectMembership;
                selectSegment[index]?.();
              }}
            />
          ) : null}

          {mList.map((member) =>
            !member.customSelector ? (
              isUserList ? (
                <PeopleSelector
                  avatarSize={32}
                  key={member.userId}
                  user={mx.getUser(member.userId)}
                  onClick={() =>
                    typeof member.customClick !== 'function'
                      ? openProfileViewer(member.userId, roomId)
                      : member.customClick()
                  }
                  contextMenu={(e) => {
                    openReusableContextMenu('bottom', getEventCords(e, '.ic-btn'), (closeMenu) => (
                      <UserOptions userId={member.userId} afterOptionSelect={closeMenu} />
                    ));

                    e.preventDefault();
                  }}
                  customData={member.customData}
                  avatarSrc={member.avatarSrc}
                  name={member.name}
                  color={colorMXID(member.userId)}
                  peopleRole={member.peopleRole}
                />
              ) : member.userId !== mx.getUserId() ? (
                <PeopleSelectorBanner
                  key={member.userId}
                  user={mx.getUser(member.userId)}
                  name={member.name}
                  color={colorMXID(member.userId)}
                  peopleRole={member.peopleRole}
                />
              ) : (
                ''
              )
            ) : (
              <member.customSelector
                key={member.userId}
                user={mx.getUser(member.userId)}
                onClick={() =>
                  typeof member.customClick !== 'function'
                    ? openProfileViewer(member.userId, roomId)
                    : member.customClick()
                }
                avatarSrc={member.avatarSrc}
                name={member.name}
                customData={member.customData}
                color={colorMXID(member.userId)}
                peopleRole={member.peopleRole}
              />
            ),
          )}

          {isUserList ? (
            <>
              {(searchedMembers?.data.length === 0 || memberList.length === 0) && (
                <div className="people-drawer__noresult">
                  <Text variant="b2">No results found!</Text>
                </div>
              )}

              <div className="people-drawer__load-more">
                {mList.length !== 0 &&
                  memberList.length > itemCount &&
                  searchedMembers === null && <Button onClick={loadMorePeople}>View more</Button>}
              </div>
            </>
          ) : null}
        </center>

        {isUserList ? (
          <div className="pt-1">
            <form onSubmit={(e) => e.preventDefault()} className="people-search">
              <div>
                <Input
                  forwardRef={searchRef}
                  type="text"
                  onChange={handleSearch}
                  placeholder="Search"
                  required
                />
              </div>
              {searchedMembers !== null && (
                <center>
                  <IconButton onClick={handleSearch} size="small" fa="fa-solid fa-xmark" />
                </center>
              )}
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

PeopleDrawer.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default PeopleDrawer;
