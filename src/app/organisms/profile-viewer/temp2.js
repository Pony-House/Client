// Menu Bar
const menubar = $(menubarRef.current);
const menuBarItems = [];

// Get refs
const bioPlace = $(bioRef.current);
const timezonePlace = $(timezoneRef.current);
const customPlace = $(customPlaceRef.current);

// Actions
const actions = {
  ethereum: renderEthereum,
};

tinyAPI.emit('profileTabs', actions);

// Execute Menu
const executeMenu = (where, tinyData) => {
  // Hide items
  bioPlace.addClass('no-show').addClass('d-none');
  timezonePlace.addClass('no-show').addClass('d-none');
  customPlace.addClass('d-none');

  // Show items back
  if (typeof actions[where] === 'function') {
    const tinyPlace = customPlace.find('#insert-custom-place');
    tinyPlace
      .empty()
      .append(
        actions[where](
          tinyPlace,
          user,
          tinyData.content?.presenceStatusMsg,
          tinyData.ethereumValid,
        ),
      );
    customPlace.removeClass('d-none');
  } else {
    timezonePlace.removeClass('no-show').removeClass('d-none');
    bioPlace.removeClass('no-show').removeClass('d-none');
  }
};

// Create menu
const menuItem = (name, openItem = null, tinyData = {}) => {
  const button = $('<a>', {
    class: `nav-link text-bg-force${openItem === tinyMenuId ? ' active' : ''}${openItem !== 'default' ? ' ms-3' : ''}`,
    href: '#',
  }).on('click', () => {
    for (const item in menuBarItems) {
      menuBarItems[item].removeClass('active');
    }

    button.addClass('active');

    executeMenu(openItem, tinyData);
    tinyMenuId = openItem;
    return false;
  });

  menuBarItems.push(button);
  return $('<li>', { class: 'nav-item' }).append(button.text(name));
};

// Create Menu Bar Time
const enableMenuBar = (content, ethereumValid, menubarReasons = 0) => {
  // Clear Menu bar
  menubar.empty().removeClass('d-none');

  // Start functions
  if (menubarReasons > 0) {
    const tinyData = { content, ethereumValid };

    // User info
    menubar.append(menuItem('User info', 'default', tinyData));

    // Ethereum
    tinyAPI.emit('profileTabsSpawnBefore', tinyData, user, (name, id) =>
      menubar.append(menuItem(name, id, tinyData)),
    );
    if (ethereumValid) {
      tinyAPI.emit('profileTabsSpawnEthereumBefore', tinyData, user, (name, id) =>
        menubar.append(menuItem(name, id, tinyData)),
      );
      menubar.append(menuItem('Ethereum', 'ethereum', tinyData));
      tinyAPI.emit('profileTabsSpawnEthereumAfter', tinyData, user, (name, id) =>
        menubar.append(menuItem(name, id, tinyData)),
      );
    }
    tinyAPI.emit('profileTabsSpawnAfter', tinyData, user, (name, id) =>
      menubar.append(menuItem(name, id, tinyData)),
    );

    // First Execute
    executeMenu(tinyMenuId, tinyData);
  }

  // Nope
  else {
    menubar.addClass('d-none');
  }
};
