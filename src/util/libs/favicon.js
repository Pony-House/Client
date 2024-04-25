const urlBase = './img/png/';
const favicon = {
  value: 'cinny.png',
  title: document.title,
  subTitle: null,
};

export function favIconQuery() {
  return $('head > #app-favicon');
}

export function titleQuery() {
  return $('head > title');
}

export function changeFavIconSubtitle(value) {
  if (typeof value === 'string') favicon.subTitle = value;
}

export function resetFavIconSubtitle() {
  favicon.subTitle = null;
}

export function changeFavIcon(value, unread = false, notis = 0, directCount = 0) {
  if (typeof value === 'string') {
    const newValue = `${urlBase}${value}`;
    favicon.value = value;

    favIconQuery().attr('href', newValue);
    // document.title = !unread ? favicon.title : `${typeof notis === 'number' && notis > 0 ? `${notis <= 99 ? `(${String(notis)})` : '(+99)'} ` : ''}${favicon.title}`;
    document.title = !unread
      ? favicon.title
      : `${typeof notis === 'number' ? `(${directCount > 0 ? `${directCount < 99 ? String(directCount) : '99+'}` : '•'}) ` : ''}${favicon.title}${typeof favicon.subTitle === 'string' ? ` | ${favicon.subTitle}` : ''}`;
  }
}

export function favIconValue() {
  return favicon.value;
}

export function checkerFavIcon() {
  setTimeout(() => {
    // Number of messages from rooms which has "All Messages" notifications enabled or when mentionned in a room with "Mentions & Keyword" notifications level.
    let directCount = 0;
    // Number of messages for rooms which has "Mentions & Keyword" notifications level set which does not directly mention you.
    let indirectCount = 0;

    // Retrieves notification badges
    const badges = $('.sidebar .sidebar-1 .notification-badge:not(.ignore-notification)');
    for (const badge of badges) {
      indirectCount++;
      const nb = Number($(badge).text());

      if (!Number.isNaN(nb) && Number.isFinite(nb)) {
        directCount += nb;
      }
    }

    // Change Icon
    const finalNumber = directCount || indirectCount;
    if (finalNumber > 0) {
      changeFavIcon('cinny-unread-red.png', true, finalNumber, directCount);
      if (__ENV_APP__.ELECTRON_MODE) {
        global.changeTrayIcon('cinny-unread-red.png');
        global.changeAppIcon('cinny-unread-red.png');
      }
    } else {
      changeFavIcon('cinny.png', false, finalNumber);
      if (__ENV_APP__.ELECTRON_MODE) {
        global.changeTrayIcon('cinny.png');
        global.changeAppIcon('cinny.png');
      }
    }
  }, 100);
}
