import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { wasm } from '@rollup/plugin-wasm';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import inject from '@rollup/plugin-inject';

const copyFiles = {
  targets: [
    {
      src: 'node_modules/web3/dist/web3.min.js',
      dest: 'js/',
    },
    {
      src: 'node_modules/jquery/dist/jquery.min.js',
      dest: 'js/',
    },
    {
      src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
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

  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Complete
  return {

    appType: 'spa',
    publicDir: true,
    base: "",

    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
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

});