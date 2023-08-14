import { defineConfig, loadEnv } from 'vite';
import * as colors from 'console-log-colors';
import react from '@vitejs/plugin-react';
import { wasm } from '@rollup/plugin-wasm';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import inject from '@rollup/plugin-inject';
import { rmSync } from 'node:fs';

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

  rmSync('dist-electron', { recursive: true, force: true });

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

  // Result object
  const result = {

    appType: 'spa',
    publicDir: true,
    base: "",

    define: {
      __ENV_APP__: Object.freeze({
        mode,
        command,
        info: {
          name: String(env.appName),
          welcome: String(env.appWelcome)
        }
      }),
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

    build: {
      outDir: 'dist',
      sourcemap: true,
      copyPublicDir: true,
      rollupOptions: {
        plugins: [
          inject({ Buffer: ['buffer', 'Buffer'] })
        ]
      }
    },

  };

  // Complete
  return result;

});