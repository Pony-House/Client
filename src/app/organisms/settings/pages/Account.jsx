import React, { useState, useRef } from 'react';
import moment from '@src/util/libs/momentjs';
import { readImageUrl } from '@src/util/libs/mediaCache';
import { avatarDefaultColor } from '@src/app/atoms/avatar/Avatar';

import initMatrix from '../../../../client/initMatrix';
import { getEventCords } from '../../../../util/common';
import { emitUpdateProfile, openEmojiBoard } from '../../../../client/action/navigation';
import { twemojifyToUrl, twemojifyUrl } from '../../../../util/twemojify';
import Button from '../../../atoms/button/Button';
import IconButton from '../../../atoms/button/IconButton';
import ProfileEditor from '../../profile-editor/ProfileEditor';
import { MenuItem } from '../../../atoms/context-menu/ContextMenu';
import RadioButton from '../../../atoms/button/RadioButton';
import ImageUpload from '../../../molecules/image-upload/ImageUpload';
import { toast } from '../../../../util/tools';
import { getStatusCSS } from '../../../../util/onlineStatus';
import { confirmDialog } from '../../../molecules/confirm-dialog/ConfirmDialog';
import { colorMXID } from '@src/util/colorMXID';

function AccountSection() {
  return <></>;
}

export default AccountSection;
