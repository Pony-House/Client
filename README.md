# Pony House
<p>
    <a href="https://github.com/Pony-House/Puddy-Cinny/releases">
        <img alt="GitHub release downloads" src="https://img.shields.io/github/downloads/JasminDreasond/Puddy-Cinny/total?logo=github&style=social"></a>
    <a href="https://twitter.com/intent/follow?screen_name=Pony-House">
        <img alt="Follow on Twitter" src="https://img.shields.io/twitter/follow/JasminDreasond?logo=twitter&style=social"></a>
</p>

A Matrix client focusing primarily on simple, elegant and secure interface. The main goal is to have an instant messaging application that is easy on people and has a modern touch.

<img align="center" src="https://github.com/Pony-House/Puddy-Cinny/blob/dev/public/img/assets/preview-1.png?raw=true" height="380">

## Motivation
I am someone who is definitely tired of seeing censorship spread across the internet. As I write this message on May 01 2023, it has been one of the most difficult days to have privacy, especially in Brazil due to the current political scenario.

I see the Matrix project as one of the best alternatives to maintain at least try to keep communities and groups of friends on the internet. So my goal is to make this fork as good as possible so that not only can I be happy, but also all the people who are having a similar situation to me.

## Getting started
Web app is available at https://client.pony.house/ and gets updated on each new release.

You can also download our desktop app from [cinny-desktop repository](https://github.com/Pony-House/Puddy-Cinny-Desktop).

To host Cinny on your own, download tarball of the app from [GitHub release](https://github.com/Pony-House/Puddy-Cinny/releases/latest).
You can serve the application with a webserver of your choice by simply copying `dist/` directory to the webroot. 
To set default Homeserver on login and register page, place a customized [`config.json`](config.json) in webroot of your choice.


## Local development
> We recommend using a version manager as versions change very quickly. You will likely need to switch 
between multiple Node.js versions based on the needs of different projects you're working on. [NVM on windows](https://github.com/coreybutler/nvm-windows#installation--upgrades) on Windows and [nvm](https://github.com/nvm-sh/nvm) on Linux/macOS are pretty good choices. Also recommended nodejs version Hydrogen LTS (v18).

Execute the following commands to start a development server:
```sh
npm ci # Installs all dependencies
npm start # Serve a development version
```

To build the app:
```sh
npm run build # Compiles the app into the dist/ directory
```