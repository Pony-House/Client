import { defineConfig } from 'vite';
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
      src: 'node_modules/@matrix-org/olm/olm.wasm',
      dest: '',
    },
    {
      src: 'config.json',
      dest: '',
    }
  ],
}

export default defineConfig({
  appType: 'spa',
  publicDir: true,
  base: "",
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
});
