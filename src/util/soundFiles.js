const soundFiles = {
  fatal_beep: new Audio('./sound/fatal_beep.ogg'),
  notification: new Audio('./sound/notification.ogg'),
  invite: new Audio('./sound/invite.ogg'),
  micro_on: new Audio('./sound/micro_on.ogg'),
  micro_off: new Audio('./sound/micro_off.ogg'),
};

export function getSound(file) {
  if (soundFiles && soundFiles[file]) {
    return soundFiles[file];
  }
}

export default soundFiles;
