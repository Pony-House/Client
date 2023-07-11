# Mod and patch Support

You can freely develop mods for Pony House. Users will have to install these mods by placing files in a separate folder. But if you want, you can build a client with these mods already pre-installed like a patch. The patched version by default does not allow the user to uninstall your mods.

Features are still under development. I will update this file with more information during the time.

## Event Arguments

The first argument will always be the final value that will be sent to the application's API.

This value must always be an object. If this object is replaced by something else, a null will be sent to the API

<hr/>

## Events

`src/client/state/navigation.js`

### ROOM_SETTINGS_TOGGLED (Not ready for production)

    isRoomSettings

### ROOM_SELECTED (Not ready for production)

    selectedRoomId
    prevSelectedRoomId
    eventId

### TAB_SELECTED (Not ready for production)

    selectedTab

### SPACE_SELECTED (Not ready for production)

    selectedSpaceId

### SELECTED_ROOM_MODE (Not ready for production)

    roomType

### SPACE_SETTINGS_OPENED (Not ready for production)

    roomId
    tabText
    isProfile

### SPACE_MANAGE_OPENED (Not ready for production)

    roomId

### SPACE_ADDEXISTING_OPENED (Not ready for production)

    roomId

### ROOM_SETTINGS_TOGGLED (Not ready for production)

    isRoomSettings
    action.tabText

### SHORTCUT_SPACES_OPENED (Not ready for production)

    <EMPTY>

### INVITE_LIST_OPENED (Not ready for production)

    <EMPTY>

### PUBLIC_ROOMS_OPENED (Not ready for production)

    searchTerm

### CREATE_ROOM_OPENED (Not ready for production)

    isSpace
    parentId

### JOIN_ALIAS_OPENED (Not ready for production)

    term

### INVITE_USER_OPENED (Not ready for production)

    roomId
    searchTerm

### PROFILE_VIEWER_OPENED (Not ready for production)

    userId
    roomId

### SETTINGS_OPENED (Not ready for production)

    tabText

### NAVIGATION_OPENED (Not ready for production)

    <EMPTY>

### EMOJIBOARD_OPENED (Not ready for production)

    cords,
    requestEmojiCallback
    dom

### READRECEIPTS_OPENED (Not ready for production)

    roomId,
    userIds,

### VIEWSOURCE_OPENED (Not ready for production)

    event

### REPLY_TO_CLICKED (Not ready for production)

    userId
    eventId
    body
    formattedBody

### SEARCH_OPENED (Not ready for production)

    term

### REUSABLE_CONTEXT_MENU_OPENED (Not ready for production)

    placement,
    cords,
    render,
    afterClose,

### REUSABLE_DIALOG_OPENED (Not ready for production)

    title,
    render,
    afterClose,

### EMOJI_VERIFICATION_OPENED (Not ready for production)

    action.request
    action.targetDevice

### PROFILE_UPDATED (Not ready for production)

    content

<hr/>

### Mod Version

You need to convince the user to install the mod on their client. 

### Patch Version

This is a build yourself version of a Pony House client. In this version your mod will already come pre-installed within the application and the user will not be able to uninstall some mods selected by you.