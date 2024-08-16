# WARNING!
The flatpak has not been tested! Follow everything at your own risk!

Reference: https://github.com/flathub/electron-sample-app/tree/master



 Flatpak:
  sudo apt install flatpak flatpak-builder elfutils
  sudo flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
  sudo flatpak install flathub org.freedesktop.Platform//21.08 org.freedesktop.Sdk//21.08 -y
  sudo flatpak install flathub org.freedesktop.Platform/x86_64/19.08 org.freedesktop.Sdk/x86_64/19.08 org.electronjs.Electron2.BaseApp/x86_64/stable -y