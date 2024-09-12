import React from 'react';

import ReadReceipts from '../read-receipts/ReadReceipts';
import ProfileViewer from '../profile-viewer/ProfileViewer';
import RoomViewer from '../profile-viewer/RoomViewer';
import ShortcutSpaces from '../shortcut-spaces/ShortcutSpaces';
import SpaceAddExisting from '../../molecules/space-add-existing/SpaceAddExisting';
import Search from '../search/Search';
import ViewSource from '../view-source/ViewSource';
import CreateRoom from '../create-room/CreateRoom';
import JoinAlias from '../join-alias/JoinAlias';
import EmojiVerification from '../emoji-verification/EmojiVerification';

import ReusableDialog from '../../molecules/dialog/ReusableDialog';
import Changelog from '../changelog/Changelog';
import ProxyModal from '../proxy-modal/ProxyModal';

function Dialogs() {
  return (
    <>
      <ReadReceipts />
      <ViewSource />
      <ProfileViewer />
      <ProxyModal />
      <Changelog />
      <RoomViewer />
      <ShortcutSpaces />
      <CreateRoom />
      <JoinAlias />
      <SpaceAddExisting />
      <Search />
      <EmojiVerification />

      <ReusableDialog />
    </>
  );
}

export default Dialogs;
