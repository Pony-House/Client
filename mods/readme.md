# Mod and patch Support

You can freely develop mods for Pony House. Users will have to install these mods by placing files in a separate folder. But if you want, you can build a client with these mods already pre-installed like a patch. The patched version by default does not allow the user to uninstall your mods.

Features are still under development. I will update this file with more information during the time.

## Event Arguments

The first argument will always be the final value that will be sent to the application's API.

This value must always be an object. If this object is replaced by something else, a null will be sent to the API

<hr/>

### Mod Version

You need to convince the user to install the mod on their client. 

### Patch Version

This is a build yourself version of a Pony House client. In this version your mod will already come pre-installed within the application and the user will not be able to uninstall some mods selected by you.