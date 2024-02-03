import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { wasm } from '@rollup/plugin-wasm';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import inject from '@rollup/plugin-inject';

import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'url';

import fse from 'fs-extra';
import electron from 'vite-plugin-electron';
import pkg from './package.json';

// Insert utils
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate Sounds Folders
const soundsFolder = path.join(__dirname, './electron/main/notification/sounds');
if (!fs.existsSync(soundsFolder)) {
  fs.mkdirSync(soundsFolder);
}

fs.copyFileSync(path.join(__dirname, './public/sound/notification.ogg'), path.join(soundsFolder, './notification.ogg'));
fs.copyFileSync(path.join(__dirname, './public/sound/invite.ogg'), path.join(soundsFolder, './invite.ogg'));

const copyFiles = {
  targets: [

    {
      src: 'node_modules/bootstrap-icons/icons/play-circle-fill.svg',
      dest: 'img/svg/',
    },

    {
      src: 'node_modules/qrcode/lib/browser.js',
      dest: 'js/qrcode/',
    },

    {
      src: 'node_modules/jquery/dist/jquery.min.js',
      dest: 'js/',
    },

    {
      src: 'node_modules/jquery-ui/dist/jquery-ui.min.js',
      dest: 'js/',
    },

    {
      src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
      dest: 'js/',
    },

    {
      src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map',
      dest: 'js/',
    },

    {
      src: 'node_modules/@matrix-org/olm/olm.wasm',
      dest: '',
    },

    {
      src: 'config/config.json',
      dest: '',
    },

    {
      src: 'README.md',
      dest: '',
    },

  ],
}

export default defineConfig(({ command, mode }) => {

  fs.rmSync('dist-electron', { recursive: true, force: true });

  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  console.log(`[vite-config] ${mode}`);
  console.log(`[vite-config] [command] ${command}`);

  console.log(`[vite-config] [is-build] ${isBuild}`);
  console.log(`[vite-config] [source-map] ${sourcemap}`);

  const env = loadEnv(mode, process.cwd(), '');
  const electronMode = (String(env.ELECTRON_MODE) === 'true' || process?.versions.electron);
  console.log(`[vite-config] [electron] ${electronMode}`);

  const envData = {

    MODE: mode,
    COMMAND: command,
    ELECTRON_MODE: electronMode,
    VERSION: pkg.version,
    DEPS: pkg.dependencies,
    PLATFORM: process.platform,
    CUSTOM_DNS: {

      ENABLED: !!(env.CUSTOM_DNS === true || env.CUSTOM_DNS === 'true'),
      PORT: Number(env.CUSTOM_DNS_PORT),

      BLOCKCHAIN: {

        ud: {
          polygon: env.UD_POLYGON_DNS,
        },

        ens: env.ETHEREUM_DNS,

      },

    },

    INFO: {
      name: String(pkg.short_name),
      description: pkg.description,
      keywords: pkg.keywords,
      author: pkg.author,
      license: pkg.license,
      welcome: String(env.APP_WELCOME)
    },

    WEB3: !!(env.WEB3 === true || env.WEB3 === 'true'),
    IPFS: !!(env.IPFS === true || env.IPFS === 'true'),

    DISCORD_STYLE: !!(env.DISCORD_STYLE === true || env.DISCORD_STYLE === 'true'),
    USE_ANIM_PARAMS: !!(env.USE_ANIM_PARAMS === true || env.USE_ANIM_PARAMS === 'true'),

    LOGIN: {
      DEFAULT_HOMESERVER: Number(env.DEFAULT_HOMESERVER),
      ALLOW_CUSTOM_HOMESERVERS: !!(typeof env.ALLOW_CUSTOM_HOMESERVERS === 'string' && env.ALLOW_CUSTOM_HOMESERVERS === 'true'),
      HOMESERVER_LIST: [],
    },

  };

  let HOMESERVER_LIST = 0;
  while (typeof env[`HOMESERVER_LIST${HOMESERVER_LIST}`] === 'string') {
    envData.LOGIN.HOMESERVER_LIST.push(env[`HOMESERVER_LIST${HOMESERVER_LIST}`]);
    HOMESERVER_LIST++;
  }

  // Result object
  const result = {

    publicDir: true,

    define: {
      __ENV_APP__: Object.freeze(envData),
    },

    server: {
      watch: {
        ignored: [
          "**/vendor/**",
          '**/release/**',
          '**/.flatpak/**',
          '**/.github/**',
          '**/.git/**',
          '**/.vscode/**',
        ],
      },
      port: 8469,
      host: true,
    },

    plugins: [
      viteStaticCopy(copyFiles),
      wasm(),
      react(),
    ],

    optimizeDeps: {
      esbuildOptions: {

        define: {
          global: 'globalThis'
        },

        plugins: [
          // Enable esbuild polyfill plugins
          NodeGlobalsPolyfillPlugin({
            process: false,
            buffer: true,
          }),
        ]

      }
    },

    resolve: { alias: {}, },

  };

  result.resolve.alias['@src'] = path.join(__dirname, 'src');
  result.resolve.alias['@mods'] = path.join(__dirname, 'mods');

  // Electron Mode
  if (electronMode) {

    // Extensions
    const extensions = [

      // Frame Wallet
      // { dist: path.join(__dirname, './electron/extensions/frame/dist'), path: 'frame' }

    ];

    for (const item in extensions) {
      fse.copySync(extensions[item].dist, path.join(__dirname, `./dist-electron/extensions/${extensions[item].path}`), { overwrite: true });
    }

    result.clearScreen = false;

    const rollupOptions = {
      external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
    };

    result.plugins.push(electron([

      {

        // Main-Process entry file of the Electron App.
        entry: 'electron/main/index.ts',

        onstart(options) {
          if (process.env.VSCODE_DEBUG) {
            console.log(/* For `.vscode/.debug.script.mjs` */'[startup] [vscode] Debug electron app')
          } else {
            options.startup()
          }
        },

        vite: {
          build: {
            sourcemap,
            minify: isBuild,
            outDir: 'dist-electron/main',
            rollupOptions,
          },
        },

      },

      {

        entry: 'electron/preload/index.ts',

        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete, 
          // instead of restarting the entire Electron App.
          options.reload()
        },

        vite: {
          build: {
            sourcemap: sourcemap ? 'inline' : undefined, // #332
            minify: isBuild,
            outDir: 'dist-electron/preload',
            rollupOptions,
          },
        },

      }

    ]));

  }

  // Normal
  else {

    result.appType = 'spa';
    result.base = '';

    result.build = {
      outDir: 'dist',
      sourcemap: true,
      copyPublicDir: true,
      rollupOptions: {
        plugins: [
          inject({ Buffer: ['buffer', 'Buffer'] })
        ]
      }
    };

  }

  // Complete
  return result;

});
