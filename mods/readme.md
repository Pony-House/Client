# Mod and patch Support

You can freely develop mods for Pony House. Users will have to install these mods by placing files in a separate folder. But if you want, you can build a client with these mods already pre-installed like a patch. The patched version by default does not allow the user to uninstall your mods.

Features are still under development. I will update this file with more information during the time.

## Event Arguments

The first argument will always be the final value that will be sent to the application's API.

This value must always be an object. If this object is replaced by something else, a null will be sent to the API.

To find out what global values are available, use this console debug. 

```ts
console.log(tinyAPI);
```

    tinyAPI.on
    tinyAPI.once

    tinyAPI.off

<hr/>

## Events

`src/client/state/navigation.js`

### roomSettingsToggled (Not ready for production)

    isRoomSettings

### roomSelected (Not ready for production)

    selectedRoomId
    prevSelectedRoomId
    eventId

### tabSelected (Not ready for production)

    selectedTab

### spaceSelected (Not ready for production)

    selectedSpaceId

### selectedRoomMode (Not ready for production)

    roomType

### spaceSettingsOpened (Not ready for production)

    roomId
    tabText
    isProfile

### spaceManageOpened (Not ready for production)

    roomId

### spaceAddExistingOpened (Not ready for production)

    roomId

### roomSettingsToggled (Not ready for production)

    isRoomSettings
    tabText

### shortcutSpacesOpened (Not ready for production)

    <EMPTY>

### inviteListOpened (Not ready for production)

    <EMPTY>

### publicRoomsOpened (Not ready for production)

    searchTerm

### createRoomOpened (Not ready for production)

    isSpace
    parentId

### joinAliasOpened (Not ready for production)

    term

### inviteUserOpened (Not ready for production)

    roomId
    searchTerm

### profileViewerOpened (Not ready for production)

    userId
    roomId

### settingsOpened (Not ready for production)

    tabText

### navigationOpened (Not ready for production)

    <EMPTY>

### emojiboardOpened (Not ready for production)

    cords
    requestEmojiCallback
    dom

### readReceiptsOpened (Not ready for production)

    roomId
    userIds

### viewSourceOpened (Not ready for production)

    event

### replyToClicked (Not ready for production)

    userId
    eventId
    body
    formattedBody

### searchOpened (Not ready for production)

    term

### reusableContextMenuOpened (Not ready for production)

    placement
    cords
    render
    afterClose

### reusableDialogOpened (Not ready for production)

    title
    render
    afterClose

### emojiVerificationOpened (Not ready for production)

    request
    targetDevice

### profileUpdated (Not ready for production)

    content

`src/client/state/AccountData.js`

### spaceShortcutUpdate (Not ready for production)

    roomId

### spaceShortcutUpdated (Not ready for production)

    roomId

### categorizeSpaceUpdated (Not ready for production)

    roomId

`src/util/AsyncSearch.js`

### searchResultSent (Not ready for production)

    findingList
    term
    config

<hr/>

### Mod Version

You need to convince the user to install the mod on their client. 

### Patch Version

This is a build yourself version of a Pony House client. In this version your mod will already come pre-installed within the application and the user will not be able to uninstall some mods selected by you.