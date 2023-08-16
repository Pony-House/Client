import { defineConfig, loadEnv } from 'vite';
import * as colors from 'console-log-colors';
import react from '@vitejs/plugin-react';
import { wasm } from '@rollup/plugin-wasm';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import inject from '@rollup/plugin-inject';
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'url';

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
      src: 'node_modules/moment-timezone/builds/*',
      dest: 'js/moment/',
    },
    {
      src: 'node_modules/moment/min/*',
      dest: 'js/moment/',
    },

    {
      src: 'node_modules/web3/dist/web3.min.js',
      dest: 'js/',
    },

    {
      src: 'node_modules/web3/dist/web3.min.js.map',
      dest: 'js/',
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
      src: 'node_modules/gasparesganga-jquery-loading-overlay/dist/loadingoverlay.min.js',
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
    }

  ],
}

export default defineConfig(({ command, mode }) => {

  fs.rmSync('dist-electron', { recursive: true, force: true });

  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  console.log(`${colors.blue('[vite-config]')} ${mode}`);
  console.log(`${colors.blue('[vite-config]')} [command] ${command}`);

  console.log(`${colors.blue('[vite-config] [is-build]')} ${isBuild}`);
  console.log(`${colors.blue('[vite-config] [source-map]')} ${sourcemap}`);

  const env = loadEnv(mode, process.cwd(), '');
  const electronMode = (String(env.ELECTRON_MODE) === 'true' || process?.versions.electron);
  console.log(`${colors.blue('[vite-config] [electron]')} ${electronMode}`);

  const envData = {
    mode,
    command,
    electron_mode: electronMode,
    info: {
      name: String(env.appName),
      welcome: String(env.appWelcome)
    }
  };

  // Result object
  const result = {

    publicDir: true,

    define: {
      __ENV_APP__: Object.freeze(envData),
    },

    server: {
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

  };

  // Electron Mode
  if (electronMode) {

    result.resolve = {
      alias: {
        '@': path.join(__dirname, 'src')
      },
    };

    result.clearScreen = false;

    result.plugins.push(electron([

      {

        // Main-Process entry file of the Electron App.
        entry: 'electron/main/index.ts',

        onstart(options) {
          if (process.env.VSCODE_DEBUG) {
            console.log(/* For `.vscode/.debug.script.mjs` */'[startup] Electron App')
          } else {
            options.startup()
          }
        },

        vite: {
          build: {
            sourcemap,
            minify: isBuild,
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
            },
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
            rollupOptions: {
              external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
            },
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

/*

if (__ENV_APP__.electron_mode) {
  global.Olm = {

    // eslint-disable-next-line object-shorthand
    init: function () {

      const args = [];
      for (const item in arguments) {
        args.push(arguments[item]);
      }

      if (!args[0]) args.push({});
      args[0].locateFile = () => '/olm.wasm';

      global.Olm = Olm;

      // eslint-disable-next-line prefer-spread
      Olm.init.apply(Olm, args);

    }

  };
} else {
  global.Olm = Olm;
}

*/