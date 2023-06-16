import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import PropTypes from 'prop-types';
import './PeopleDrawer.scss';

import initMatrix from '../../../client/initMatrix';
import { getPowerLabel, getUsernameOfRoomMember } from '../../../util/matrixUtil';
import { colorMXID } from '../../../util/colorMXID';
import { openInviteUser, openProfileViewer } from '../../../client/action/navigation';
import AsyncSearch from '../../../util/AsyncSearch';
import { memberByAtoZ, memberByPowerLevel } from '../../../util/sort';

import Text from '../../atoms/text/Text';
import { Header } from '../../atoms/header/Header';
import IconButton from '../../atoms/button/IconButton';
import Button from '../../atoms/button/Button';
import Input from '../../atoms/input/Input';
import SegmentedControl from '../../atoms/segmented-controls/SegmentedControls';
import PeopleSelector from '../../molecules/people-selector/PeopleSelector';

function simplyfiMembers(members) {
  const mx = initMatrix.matrixClient;
  return members.map((member) => ({
    user: member.user,
    userId: member.userId,
    name: getUsernameOfRoomMember(member),
    username: member.userId.slice(1, member.userId.indexOf(':')),
    avatarSrc: member.getAvatarUrl(mx.baseUrl, 24, 24, 'crop'),
    peopleRole: getPowerLabel(member.powerLevel),
    powerLevel: members.powerLevel,
  }));
}

const asyncSearch = new AsyncSearch();
function PeopleDrawer({ roomId }) {

  const PER_PAGE_MEMBER = 50;
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  const canInvite = room?.canInvite(mx.getUserId());

  const [itemCount, setItemCount] = useState(PER_PAGE_MEMBER);
  const [membership, setMembership] = useState('join');
  const [memberList, setMemberList] = useState([]);
  const [searchedMembers, setSearchedMembers] = useState(null);
  const searchRef = useRef(null);

  const getMembersWithMembership = useCallback(
    (mship) => room.getMembersWithMembership(mship),
    [roomId, membership],
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
    if (term === '' || term === undefined) {
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
      setMemberList(
        simplyfiMembers(
          getMembersWithMembership(membership)
            .sort(memberByAtoZ).sort(memberByPowerLevel),
        ),
      );
    };

    searchRef.current.value = '';
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
    setMembership('join');
  }, [roomId]);

  const mList = searchedMembers !== null ? searchedMembers.data : memberList.slice(0, itemCount);
  return (
    <div className="people-drawer">
      <Header>

        <ul className='navbar-nav mr-auto pb-1'>

          <li className="nav-item ps-2">
            People
            <div className="very-small text-gray">{`${room.getJoinedMemberCount()} members`}</div>
          </li>

        </ul>

        <ul className='navbar-nav ms-auto mb-0 small'>
          <li className="nav-item">
            <IconButton onClick={() => openInviteUser(roomId)} tooltip="Invite" fa="fa-solid fa-user-plus" disabled={!canInvite} />
          </li>
        </ul>

      </Header>

      <div className="people-drawer__content-wrapper">

        <center className='p-3 w-100' style={{
          'height': '100%',
          'overflowY': 'auto'
        }}>

          <SegmentedControl
            className='pb-3'
            selected={
              (() => {
                const getSegmentIndex = {
                  join: 0,
                  invite: 1,
                  ban: 2,
                };
                return getSegmentIndex[membership];
              })()
            }
            segments={[{ text: 'Joined' }, { text: 'Invited' }, { text: 'Banned' }]}
            onSelect={(index) => {
              const selectSegment = [
                () => setMembership('join'),
                () => setMembership('invite'),
                () => setMembership('ban'),
              ];
              selectSegment[index]?.();
            }}
          />

          {
            mList.map((member) => (
              <PeopleSelector
                key={member.userId}
                user={member.user}
                onClick={() => openProfileViewer(member.userId, roomId)}
                avatarSrc={member.avatarSrc}
                name={member.name}
                color={colorMXID(member.userId)}
                peopleRole={member.peopleRole}
              />
            ))
          }

          {
            (searchedMembers?.data.length === 0 || memberList.length === 0)
            && (
              <div className="people-drawer__noresult">
                <Text variant="b2">No results found!</Text>
              </div>
            )
          }

          <div className="people-drawer__load-more">
            {
              mList.length !== 0
              && memberList.length > itemCount
              && searchedMembers === null
              && (
                <Button onClick={loadMorePeople}>View more</Button>
              )
            }
          </div>

        </center>

        <div className="pt-1">
          <form onSubmit={(e) => e.preventDefault()} className="people-search">
            <div><Input forwardRef={searchRef} type="text" onChange={handleSearch} placeholder="Search" required /></div>
            {
              searchedMembers !== null
              && <center><IconButton onClick={handleSearch} size="small" fa="fa-solid fa-xmark" /></center>
            }
          </form>
        </div>

      </div>

    </div>
  );
}

PeopleDrawer.propTypes = {
  roomId: PropTypes.string.isRequired,
};

export default PeopleDrawer;
