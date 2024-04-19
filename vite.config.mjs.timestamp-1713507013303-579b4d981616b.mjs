// vite.config.mjs
import { defineConfig, loadEnv } from "file:///media/jasmindreasond/tiny-cookie-hd/git-repositories/Matrix/Pony-House/cinny/node_modules/vite/dist/node/index.js";
import react from "file:///media/jasmindreasond/tiny-cookie-hd/git-repositories/Matrix/Pony-House/cinny/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { wasm } from "file:///media/jasmindreasond/tiny-cookie-hd/git-repositories/Matrix/Pony-House/cinny/node_modules/@rollup/plugin-wasm/dist/es/index.js";
import { viteStaticCopy } from "file:///media/jasmindreasond/tiny-cookie-hd/git-repositories/Matrix/Pony-House/cinny/node_modules/vite-plugin-static-copy/dist/index.js";
import { NodeGlobalsPolyfillPlugin } from "file:///media/jasmindreasond/tiny-cookie-hd/git-repositories/Matrix/Pony-House/cinny/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import inject from "file:///media/jasmindreasond/tiny-cookie-hd/git-repositories/Matrix/Pony-House/cinny/node_modules/@rollup/plugin-inject/dist/es/index.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import fse from "file:///media/jasmindreasond/tiny-cookie-hd/git-repositories/Matrix/Pony-House/cinny/node_modules/fs-extra/lib/index.js";
import electron from "file:///media/jasmindreasond/tiny-cookie-hd/git-repositories/Matrix/Pony-House/cinny/node_modules/vite-plugin-electron/dist/index.mjs";

// package.json
var package_default = {
  name: "pony-house-matrix",
  version: "1.3.40",
  short_name: "Pony House",
  description: "The open source house, your house, the house for all matrix ponies",
  main: "dist-electron/main/index.js",
  engines: {
    node: ">=20.0.0"
  },
  scripts: {
    start: "git submodule update --init && vite dev",
    build: "git submodule update --init && vite build",
    "build:8gb": "git submodule update --init && cross-env NODE_OPTIONS=--max-old-space-size=8192 vite build",
    "electron:start": "git submodule update --init && cross-env ELECTRON_MODE=true vite dev",
    "electron:build": "git submodule update --init && cross-env ELECTRON_MODE=true vite build && electron-builder",
    lint: "yarn check:eslint && yarn check:prettier",
    "check:eslint": "eslint src/* && eslint electron/* && eslint mods/* --no-error-on-unmatched-pattern",
    "check:prettier": "prettier --check src/* && prettier --check electron/* && prettier --check mods/*",
    "fix:prettier": "prettier --write src/* && prettier --write electron/* && prettier --write mods/*",
    "fix:src:prettier": "prettier --write src/*",
    "fix:electron:prettier": "prettier --write electron/*",
    "fix:mods:prettier": "prettier --write mods/*",
    "public:check:eslint": "eslint public/*",
    "public:check:prettier": "prettier --check public/*",
    "public:fix:prettier": "prettier --write public/*"
  },
  keywords: [
    "react",
    "javascript",
    "website",
    "matrix",
    "pony",
    "matrix-client",
    "brony",
    "brony-fandom",
    "pony-house"
  ],
  author: {
    name: "JasminDreasond (Yasmin Seidel)",
    email: "tiny@puddy.club",
    url: "https://github.com/JasminDreasond"
  },
  license: "AGPL-3.0-only",
  dependencies: {
    "@cryptofonts/cryptofont": "1.3.5",
    "@fortawesome/fontawesome-free": "6.5.2",
    "@khanacademy/simple-markdown": "0.11.4",
    "@matrix-org/olm": "3.2.15",
    "@tippyjs/react": "4.2.6",
    "@xmtp/xmtp-js": "11.5.0",
    "auto-launch": "5.0.6",
    blurhash: "2.0.5",
    bootstrap: "5.3.3",
    "bootstrap-icons": "1.11.3",
    buffer: "6.0.3",
    chokidar: "3.6.0",
    "cid-tool": "3.0.0",
    clone: "2.1.2",
    "compare-versions": "6.1.0",
    "emojibase-data": "7.0.1",
    "eth-provider": "0.13.6",
    ethers: "6.11.1",
    "file-saver": "2.0.5",
    flux: "4.0.4",
    formik: "2.4.5",
    freezeframe: "5.0.2",
    "generate-api-key": "1.0.2",
    "highlight.js": "11.9.0",
    "html-react-parser": "5.1.10",
    "ipaddr.js": "2.1.0",
    jquery: "3.7.1",
    "jquery-ui": "1.13.2",
    katex: "0.16.10",
    "linkify-html": "4.1.3",
    "linkify-plugin-keyword": "4.1.3",
    "linkify-react": "4.1.3",
    linkifyjs: "4.1.3",
    "matrix-encrypt-attachment": "1.0.3",
    "matrix-js-sdk": "32.0.0",
    md5: "2.3.0",
    "moment-timezone": "0.5.45",
    "native-node-dns": "0.7.6",
    "node-fetch": "2",
    "object-hash": "3.0.0",
    photoswipe: "5.4.3",
    "prop-types": "15.8.1",
    qrcode: "1.5.3",
    react: "18.2.0",
    "react-autosize-textarea": "7.1.0",
    "react-blurhash": "0.3.0",
    "react-bootstrap": "2.10.2",
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-dom": "18.2.0",
    "react-google-recaptcha": "3.1.0",
    "sanitize-html": "2.13.0",
    slate: "0.102.0",
    "slate-history": "0.100.0",
    "slate-react": "0.102.0",
    "tippy.js": "6.3.7",
    twemoji: "14.0.2",
    "web3-providers-ws": "4.0.7",
    yjs: "13.6.14"
  },
  devDependencies: {
    "@esbuild-plugins/node-globals-polyfill": "0.2.3",
    "@rollup/plugin-inject": "5.0.5",
    "@rollup/plugin-wasm": "6.2.2",
    "@types/node": "20.12.7",
    "@types/react": "18.2.79",
    "@types/react-dom": "18.2.25",
    "@typescript-eslint/eslint-plugin": "7.7.0",
    "@typescript-eslint/parser": "7.7.0",
    "@vitejs/plugin-react": "4.2.1",
    "cross-env": "7.0.3",
    "download-git-repo": "3.0.2",
    electron: "^30.0.0",
    "electron-builder": "^24.9.1",
    eslint: "9.0.0",
    "eslint-config-airbnb": "19.0.4",
    "eslint-config-prettier": "9.1.0",
    "eslint-plugin-import": "2.29.1",
    "eslint-plugin-jsx-a11y": "6.8.0",
    "eslint-plugin-react": "7.34.1",
    "eslint-plugin-react-hooks": "4.6.0",
    esm: "^3.2.25",
    "fs-extra": "^11.1.1",
    prettier: "3.2.5",
    sass: "1.75.0",
    typescript: "5.4.5",
    vite: "5.2.8",
    "vite-plugin-electron": "^0.28.4",
    "vite-plugin-electron-renderer": "^0.14.5",
    "vite-plugin-static-copy": "1.0.2"
  },
  private: true
};

// vite.config.mjs
var __vite_injected_original_import_meta_url = "file:///media/jasmindreasond/tiny-cookie-hd/git-repositories/Matrix/Pony-House/cinny/vite.config.mjs";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = path.dirname(__filename);
var soundsFolder = path.join(__dirname, "./electron/main/notification/sounds");
if (!fs.existsSync(soundsFolder)) {
  fs.mkdirSync(soundsFolder);
}
fs.copyFileSync(path.join(__dirname, "./public/sound/notification.ogg"), path.join(soundsFolder, "./notification.ogg"));
fs.copyFileSync(path.join(__dirname, "./public/sound/invite.ogg"), path.join(soundsFolder, "./invite.ogg"));
fse.copySync(path.join(__dirname, "./vendor/twemoji/assets"), path.join(__dirname, "./public/img/twemoji"), { overwrite: true });
var copyFiles = {
  targets: [
    {
      src: "node_modules/bootstrap-icons/icons/play-circle-fill.svg",
      dest: "img/svg/"
    },
    {
      src: "node_modules/qrcode/lib/browser.js",
      dest: "js/qrcode/"
    },
    {
      src: "node_modules/jquery/dist/jquery.min.js",
      dest: "js/"
    },
    {
      src: "node_modules/jquery-ui/dist/jquery-ui.min.js",
      dest: "js/"
    },
    {
      src: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
      dest: "js/"
    },
    {
      src: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map",
      dest: "js/"
    },
    {
      src: "node_modules/@matrix-org/olm/olm.wasm",
      dest: ""
    },
    {
      src: "config/config.json",
      dest: ""
    },
    {
      src: "README.md",
      dest: ""
    }
  ]
};
var vite_config_default = defineConfig(({ command, mode }) => {
  fs.rmSync("dist-electron", { recursive: true, force: true });
  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;
  console.log(`[vite-config] ${mode}`);
  console.log(`[vite-config] [command] ${command}`);
  console.log(`[vite-config] [is-build] ${isBuild}`);
  console.log(`[vite-config] [source-map] ${sourcemap}`);
  const env = loadEnv(mode, process.cwd(), "");
  const electronMode = String(env.ELECTRON_MODE) === "true" || process?.versions.electron;
  console.log(`[vite-config] [electron] ${electronMode}`);
  const envData = {
    MODE: mode,
    COMMAND: command,
    ELECTRON_MODE: electronMode,
    VERSION: package_default.version,
    DEPS: package_default.dependencies,
    PLATFORM: process.platform,
    CUSTOM_DNS: {
      ENABLED: !!(env.CUSTOM_DNS === true || env.CUSTOM_DNS === "true"),
      PORT: Number(env.CUSTOM_DNS_PORT),
      BLOCKCHAIN: {
        ud: {
          polygon: env.UD_POLYGON_DNS
        },
        ens: env.ETHEREUM_DNS
      }
    },
    INFO: {
      name: String(package_default.short_name),
      description: package_default.description,
      keywords: package_default.keywords,
      author: package_default.author,
      license: package_default.license,
      welcome: String(env.APP_WELCOME)
    },
    WEB3: !!(env.WEB3 === true || env.WEB3 === "true"),
    IPFS: !!(env.IPFS === true || env.IPFS === "true"),
    SAVE_ROOM_DB: !!(env.SAVE_ROOM_DB === true || env.SAVE_ROOM_DB === "true"),
    DISCORD_STYLE: !!(env.DISCORD_STYLE === true || env.DISCORD_STYLE === "true"),
    SHOW_STICKERS: !!(env.SHOW_STICKERS === true || env.SHOW_STICKERS === "true"),
    USE_CUSTOM_EMOJIS: !!(env.USE_CUSTOM_EMOJIS === true || env.USE_CUSTOM_EMOJIS === "true"),
    USE_ANIM_PARAMS: !!(env.USE_ANIM_PARAMS === true || env.USE_ANIM_PARAMS === "true"),
    LOGIN: {
      DEFAULT_HOMESERVER: Number(env.DEFAULT_HOMESERVER),
      ALLOW_CUSTOM_HOMESERVERS: !!(typeof env.ALLOW_CUSTOM_HOMESERVERS === "string" && env.ALLOW_CUSTOM_HOMESERVERS === "true"),
      HOMESERVER_LIST: []
    }
  };
  let HOMESERVER_LIST = 0;
  while (typeof env[`HOMESERVER_LIST${HOMESERVER_LIST}`] === "string") {
    envData.LOGIN.HOMESERVER_LIST.push(env[`HOMESERVER_LIST${HOMESERVER_LIST}`]);
    HOMESERVER_LIST++;
  }
  const result = {
    publicDir: true,
    define: {
      __ENV_APP__: Object.freeze(envData)
    },
    server: {
      hmr: {
        overlay: true
      },
      watch: {
        ignored: [
          "**/vendor/**",
          "**/release/**",
          "**/.flatpak/**",
          "**/.github/**",
          "**/.git/**",
          "**/.vscode/**"
        ]
      },
      port: 8469,
      host: true
    },
    plugins: [
      viteStaticCopy(copyFiles),
      wasm(),
      react()
    ],
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: "globalThis"
        },
        plugins: [
          // Enable esbuild polyfill plugins
          NodeGlobalsPolyfillPlugin({
            process: false,
            buffer: true
          })
        ]
      }
    },
    resolve: { alias: {} }
  };
  result.resolve.alias["@src"] = path.join(__dirname, "src");
  result.resolve.alias["@mods"] = path.join(__dirname, "mods");
  const rollupOptions = {
    plugins: [
      inject({ Buffer: ["buffer", "Buffer"] })
    ]
  };
  if (electronMode) {
    const extensions = [
      // Frame Wallet
      // { dist: path.join(__dirname, './electron/extensions/frame/dist'), path: 'frame' }
    ];
    for (const item in extensions) {
      fse.copySync(extensions[item].dist, path.join(__dirname, `./dist-electron/extensions/${extensions[item].path}`), { overwrite: true });
    }
    result.clearScreen = false;
    rollupOptions.external = Object.keys("dependencies" in package_default ? package_default.dependencies : {});
    result.plugins.push(electron([
      {
        // Main-Process entry file of the Electron App.
        entry: "electron/main/index.ts",
        onstart(options) {
          if (process.env.VSCODE_DEBUG) {
            console.log(
              /* For `.vscode/.debug.script.mjs` */
              "[startup] [vscode] Debug electron app"
            );
          } else {
            options.startup();
          }
        },
        vite: {
          define: result.define,
          resolve: result.resolve,
          build: {
            sourcemap,
            minify: isBuild,
            outDir: "dist-electron/main",
            rollupOptions
          }
        }
      },
      {
        entry: "electron/preload/index.ts",
        onstart(options) {
          options.reload();
        },
        vite: {
          define: result.define,
          resolve: result.resolve,
          build: {
            sourcemap: sourcemap ? "inline" : void 0,
            // #332
            minify: isBuild,
            outDir: "dist-electron/preload",
            rollupOptions
          }
        }
      }
    ]));
  } else {
    result.appType = "spa";
    result.base = "";
    result.build = {
      outDir: "dist",
      sourcemap: true,
      copyPublicDir: true,
      rollupOptions
    };
  }
  return result;
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIiwgInBhY2thZ2UuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9tZWRpYS9qYXNtaW5kcmVhc29uZC90aW55LWNvb2tpZS1oZC9naXQtcmVwb3NpdG9yaWVzL01hdHJpeC9Qb255LUhvdXNlL2Npbm55XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvbWVkaWEvamFzbWluZHJlYXNvbmQvdGlueS1jb29raWUtaGQvZ2l0LXJlcG9zaXRvcmllcy9NYXRyaXgvUG9ueS1Ib3VzZS9jaW5ueS92aXRlLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL21lZGlhL2phc21pbmRyZWFzb25kL3RpbnktY29va2llLWhkL2dpdC1yZXBvc2l0b3JpZXMvTWF0cml4L1BvbnktSG91c2UvY2lubnkvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgd2FzbSB9IGZyb20gJ0Byb2xsdXAvcGx1Z2luLXdhc20nO1xuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tICd2aXRlLXBsdWdpbi1zdGF0aWMtY29weSc7XG5pbXBvcnQgeyBOb2RlR2xvYmFsc1BvbHlmaWxsUGx1Z2luIH0gZnJvbSAnQGVzYnVpbGQtcGx1Z2lucy9ub2RlLWdsb2JhbHMtcG9seWZpbGwnO1xuaW1wb3J0IGluamVjdCBmcm9tICdAcm9sbHVwL3BsdWdpbi1pbmplY3QnO1xuXG5pbXBvcnQgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcblxuaW1wb3J0IGZzZSBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgZWxlY3Ryb24gZnJvbSAndml0ZS1wbHVnaW4tZWxlY3Ryb24nO1xuaW1wb3J0IHBrZyBmcm9tICcuL3BhY2thZ2UuanNvbic7XG5cbi8vIEluc2VydCB1dGlsc1xuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKTtcblxuLy8gVmFsaWRhdGUgU291bmRzIEZvbGRlcnNcbmNvbnN0IHNvdW5kc0ZvbGRlciA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2VsZWN0cm9uL21haW4vbm90aWZpY2F0aW9uL3NvdW5kcycpO1xuaWYgKCFmcy5leGlzdHNTeW5jKHNvdW5kc0ZvbGRlcikpIHtcbiAgZnMubWtkaXJTeW5jKHNvdW5kc0ZvbGRlcik7XG59XG5cbmZzLmNvcHlGaWxlU3luYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi9wdWJsaWMvc291bmQvbm90aWZpY2F0aW9uLm9nZycpLCBwYXRoLmpvaW4oc291bmRzRm9sZGVyLCAnLi9ub3RpZmljYXRpb24ub2dnJykpO1xuZnMuY29weUZpbGVTeW5jKHBhdGguam9pbihfX2Rpcm5hbWUsICcuL3B1YmxpYy9zb3VuZC9pbnZpdGUub2dnJyksIHBhdGguam9pbihzb3VuZHNGb2xkZXIsICcuL2ludml0ZS5vZ2cnKSk7XG5mc2UuY29weVN5bmMocGF0aC5qb2luKF9fZGlybmFtZSwgJy4vdmVuZG9yL3R3ZW1vamkvYXNzZXRzJyksIHBhdGguam9pbihfX2Rpcm5hbWUsICcuL3B1YmxpYy9pbWcvdHdlbW9qaScpLCB7IG92ZXJ3cml0ZTogdHJ1ZSB9KTtcblxuY29uc3QgY29weUZpbGVzID0ge1xuICB0YXJnZXRzOiBbXG5cbiAgICB7XG4gICAgICBzcmM6ICdub2RlX21vZHVsZXMvYm9vdHN0cmFwLWljb25zL2ljb25zL3BsYXktY2lyY2xlLWZpbGwuc3ZnJyxcbiAgICAgIGRlc3Q6ICdpbWcvc3ZnLycsXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHNyYzogJ25vZGVfbW9kdWxlcy9xcmNvZGUvbGliL2Jyb3dzZXIuanMnLFxuICAgICAgZGVzdDogJ2pzL3FyY29kZS8nLFxuICAgIH0sXG5cbiAgICB7XG4gICAgICBzcmM6ICdub2RlX21vZHVsZXMvanF1ZXJ5L2Rpc3QvanF1ZXJ5Lm1pbi5qcycsXG4gICAgICBkZXN0OiAnanMvJyxcbiAgICB9LFxuXG4gICAge1xuICAgICAgc3JjOiAnbm9kZV9tb2R1bGVzL2pxdWVyeS11aS9kaXN0L2pxdWVyeS11aS5taW4uanMnLFxuICAgICAgZGVzdDogJ2pzLycsXG4gICAgfSxcblxuICAgIHtcbiAgICAgIHNyYzogJ25vZGVfbW9kdWxlcy9ib290c3RyYXAvZGlzdC9qcy9ib290c3RyYXAuYnVuZGxlLm1pbi5qcycsXG4gICAgICBkZXN0OiAnanMvJyxcbiAgICB9LFxuXG4gICAge1xuICAgICAgc3JjOiAnbm9kZV9tb2R1bGVzL2Jvb3RzdHJhcC9kaXN0L2pzL2Jvb3RzdHJhcC5idW5kbGUubWluLmpzLm1hcCcsXG4gICAgICBkZXN0OiAnanMvJyxcbiAgICB9LFxuXG4gICAge1xuICAgICAgc3JjOiAnbm9kZV9tb2R1bGVzL0BtYXRyaXgtb3JnL29sbS9vbG0ud2FzbScsXG4gICAgICBkZXN0OiAnJyxcbiAgICB9LFxuXG4gICAge1xuICAgICAgc3JjOiAnY29uZmlnL2NvbmZpZy5qc29uJyxcbiAgICAgIGRlc3Q6ICcnLFxuICAgIH0sXG5cbiAgICB7XG4gICAgICBzcmM6ICdSRUFETUUubWQnLFxuICAgICAgZGVzdDogJycsXG4gICAgfSxcblxuICBdLFxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgY29tbWFuZCwgbW9kZSB9KSA9PiB7XG5cbiAgZnMucm1TeW5jKCdkaXN0LWVsZWN0cm9uJywgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pO1xuXG4gIGNvbnN0IGlzU2VydmUgPSBjb21tYW5kID09PSAnc2VydmUnXG4gIGNvbnN0IGlzQnVpbGQgPSBjb21tYW5kID09PSAnYnVpbGQnXG4gIGNvbnN0IHNvdXJjZW1hcCA9IGlzU2VydmUgfHwgISFwcm9jZXNzLmVudi5WU0NPREVfREVCVUc7XG5cbiAgLy8gTG9hZCBlbnYgZmlsZSBiYXNlZCBvbiBgbW9kZWAgaW4gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gIC8vIFNldCB0aGUgdGhpcmQgcGFyYW1ldGVyIHRvICcnIHRvIGxvYWQgYWxsIGVudiByZWdhcmRsZXNzIG9mIHRoZSBgVklURV9gIHByZWZpeC5cbiAgY29uc29sZS5sb2coYFt2aXRlLWNvbmZpZ10gJHttb2RlfWApO1xuICBjb25zb2xlLmxvZyhgW3ZpdGUtY29uZmlnXSBbY29tbWFuZF0gJHtjb21tYW5kfWApO1xuXG4gIGNvbnNvbGUubG9nKGBbdml0ZS1jb25maWddIFtpcy1idWlsZF0gJHtpc0J1aWxkfWApO1xuICBjb25zb2xlLmxvZyhgW3ZpdGUtY29uZmlnXSBbc291cmNlLW1hcF0gJHtzb3VyY2VtYXB9YCk7XG5cbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIGNvbnN0IGVsZWN0cm9uTW9kZSA9IChTdHJpbmcoZW52LkVMRUNUUk9OX01PREUpID09PSAndHJ1ZScgfHwgcHJvY2Vzcz8udmVyc2lvbnMuZWxlY3Ryb24pO1xuICBjb25zb2xlLmxvZyhgW3ZpdGUtY29uZmlnXSBbZWxlY3Ryb25dICR7ZWxlY3Ryb25Nb2RlfWApO1xuXG4gIGNvbnN0IGVudkRhdGEgPSB7XG5cbiAgICBNT0RFOiBtb2RlLFxuICAgIENPTU1BTkQ6IGNvbW1hbmQsXG4gICAgRUxFQ1RST05fTU9ERTogZWxlY3Ryb25Nb2RlLFxuICAgIFZFUlNJT046IHBrZy52ZXJzaW9uLFxuICAgIERFUFM6IHBrZy5kZXBlbmRlbmNpZXMsXG4gICAgUExBVEZPUk06IHByb2Nlc3MucGxhdGZvcm0sXG4gICAgQ1VTVE9NX0ROUzoge1xuXG4gICAgICBFTkFCTEVEOiAhIShlbnYuQ1VTVE9NX0ROUyA9PT0gdHJ1ZSB8fCBlbnYuQ1VTVE9NX0ROUyA9PT0gJ3RydWUnKSxcbiAgICAgIFBPUlQ6IE51bWJlcihlbnYuQ1VTVE9NX0ROU19QT1JUKSxcblxuICAgICAgQkxPQ0tDSEFJTjoge1xuXG4gICAgICAgIHVkOiB7XG4gICAgICAgICAgcG9seWdvbjogZW52LlVEX1BPTFlHT05fRE5TLFxuICAgICAgICB9LFxuXG4gICAgICAgIGVuczogZW52LkVUSEVSRVVNX0ROUyxcblxuICAgICAgfSxcblxuICAgIH0sXG5cbiAgICBJTkZPOiB7XG4gICAgICBuYW1lOiBTdHJpbmcocGtnLnNob3J0X25hbWUpLFxuICAgICAgZGVzY3JpcHRpb246IHBrZy5kZXNjcmlwdGlvbixcbiAgICAgIGtleXdvcmRzOiBwa2cua2V5d29yZHMsXG4gICAgICBhdXRob3I6IHBrZy5hdXRob3IsXG4gICAgICBsaWNlbnNlOiBwa2cubGljZW5zZSxcbiAgICAgIHdlbGNvbWU6IFN0cmluZyhlbnYuQVBQX1dFTENPTUUpXG4gICAgfSxcblxuICAgIFdFQjM6ICEhKGVudi5XRUIzID09PSB0cnVlIHx8IGVudi5XRUIzID09PSAndHJ1ZScpLFxuICAgIElQRlM6ICEhKGVudi5JUEZTID09PSB0cnVlIHx8IGVudi5JUEZTID09PSAndHJ1ZScpLFxuXG4gICAgU0FWRV9ST09NX0RCOiAhIShlbnYuU0FWRV9ST09NX0RCID09PSB0cnVlIHx8IGVudi5TQVZFX1JPT01fREIgPT09ICd0cnVlJyksXG4gICAgRElTQ09SRF9TVFlMRTogISEoZW52LkRJU0NPUkRfU1RZTEUgPT09IHRydWUgfHwgZW52LkRJU0NPUkRfU1RZTEUgPT09ICd0cnVlJyksXG4gICAgU0hPV19TVElDS0VSUzogISEoZW52LlNIT1dfU1RJQ0tFUlMgPT09IHRydWUgfHwgZW52LlNIT1dfU1RJQ0tFUlMgPT09ICd0cnVlJyksXG4gICAgVVNFX0NVU1RPTV9FTU9KSVM6ICEhKGVudi5VU0VfQ1VTVE9NX0VNT0pJUyA9PT0gdHJ1ZSB8fCBlbnYuVVNFX0NVU1RPTV9FTU9KSVMgPT09ICd0cnVlJyksXG4gICAgVVNFX0FOSU1fUEFSQU1TOiAhIShlbnYuVVNFX0FOSU1fUEFSQU1TID09PSB0cnVlIHx8IGVudi5VU0VfQU5JTV9QQVJBTVMgPT09ICd0cnVlJyksXG5cbiAgICBMT0dJTjoge1xuICAgICAgREVGQVVMVF9IT01FU0VSVkVSOiBOdW1iZXIoZW52LkRFRkFVTFRfSE9NRVNFUlZFUiksXG4gICAgICBBTExPV19DVVNUT01fSE9NRVNFUlZFUlM6ICEhKHR5cGVvZiBlbnYuQUxMT1dfQ1VTVE9NX0hPTUVTRVJWRVJTID09PSAnc3RyaW5nJyAmJiBlbnYuQUxMT1dfQ1VTVE9NX0hPTUVTRVJWRVJTID09PSAndHJ1ZScpLFxuICAgICAgSE9NRVNFUlZFUl9MSVNUOiBbXSxcbiAgICB9LFxuXG4gIH07XG5cbiAgbGV0IEhPTUVTRVJWRVJfTElTVCA9IDA7XG4gIHdoaWxlICh0eXBlb2YgZW52W2BIT01FU0VSVkVSX0xJU1Qke0hPTUVTRVJWRVJfTElTVH1gXSA9PT0gJ3N0cmluZycpIHtcbiAgICBlbnZEYXRhLkxPR0lOLkhPTUVTRVJWRVJfTElTVC5wdXNoKGVudltgSE9NRVNFUlZFUl9MSVNUJHtIT01FU0VSVkVSX0xJU1R9YF0pO1xuICAgIEhPTUVTRVJWRVJfTElTVCsrO1xuICB9XG5cbiAgLy8gUmVzdWx0IG9iamVjdFxuICBjb25zdCByZXN1bHQgPSB7XG5cbiAgICBwdWJsaWNEaXI6IHRydWUsXG5cbiAgICBkZWZpbmU6IHtcbiAgICAgIF9fRU5WX0FQUF9fOiBPYmplY3QuZnJlZXplKGVudkRhdGEpLFxuICAgIH0sXG5cbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhtcjoge1xuICAgICAgICBvdmVybGF5OiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHdhdGNoOiB7XG4gICAgICAgIGlnbm9yZWQ6IFtcbiAgICAgICAgICBcIioqL3ZlbmRvci8qKlwiLFxuICAgICAgICAgICcqKi9yZWxlYXNlLyoqJyxcbiAgICAgICAgICAnKiovLmZsYXRwYWsvKionLFxuICAgICAgICAgICcqKi8uZ2l0aHViLyoqJyxcbiAgICAgICAgICAnKiovLmdpdC8qKicsXG4gICAgICAgICAgJyoqLy52c2NvZGUvKionLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHBvcnQ6IDg0NjksXG4gICAgICBob3N0OiB0cnVlLFxuICAgIH0sXG5cbiAgICBwbHVnaW5zOiBbXG4gICAgICB2aXRlU3RhdGljQ29weShjb3B5RmlsZXMpLFxuICAgICAgd2FzbSgpLFxuICAgICAgcmVhY3QoKSxcbiAgICBdLFxuXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBlc2J1aWxkT3B0aW9uczoge1xuXG4gICAgICAgIGRlZmluZToge1xuICAgICAgICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnXG4gICAgICAgIH0sXG5cbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgIC8vIEVuYWJsZSBlc2J1aWxkIHBvbHlmaWxsIHBsdWdpbnNcbiAgICAgICAgICBOb2RlR2xvYmFsc1BvbHlmaWxsUGx1Z2luKHtcbiAgICAgICAgICAgIHByb2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgYnVmZmVyOiB0cnVlLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdXG5cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVzb2x2ZTogeyBhbGlhczoge30sIH0sXG5cbiAgfTtcblxuICByZXN1bHQucmVzb2x2ZS5hbGlhc1snQHNyYyddID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ3NyYycpO1xuICByZXN1bHQucmVzb2x2ZS5hbGlhc1snQG1vZHMnXSA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdtb2RzJyk7XG5cbiAgY29uc3Qgcm9sbHVwT3B0aW9ucyA9IHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICBpbmplY3QoeyBCdWZmZXI6IFsnYnVmZmVyJywgJ0J1ZmZlciddIH0pXG4gICAgXSxcbiAgfTtcblxuICAvLyBFbGVjdHJvbiBNb2RlXG4gIGlmIChlbGVjdHJvbk1vZGUpIHtcblxuICAgIC8vIEV4dGVuc2lvbnNcbiAgICBjb25zdCBleHRlbnNpb25zID0gW1xuXG4gICAgICAvLyBGcmFtZSBXYWxsZXRcbiAgICAgIC8vIHsgZGlzdDogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vZWxlY3Ryb24vZXh0ZW5zaW9ucy9mcmFtZS9kaXN0JyksIHBhdGg6ICdmcmFtZScgfVxuXG4gICAgXTtcblxuICAgIGZvciAoY29uc3QgaXRlbSBpbiBleHRlbnNpb25zKSB7XG4gICAgICBmc2UuY29weVN5bmMoZXh0ZW5zaW9uc1tpdGVtXS5kaXN0LCBwYXRoLmpvaW4oX19kaXJuYW1lLCBgLi9kaXN0LWVsZWN0cm9uL2V4dGVuc2lvbnMvJHtleHRlbnNpb25zW2l0ZW1dLnBhdGh9YCksIHsgb3ZlcndyaXRlOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIHJlc3VsdC5jbGVhclNjcmVlbiA9IGZhbHNlO1xuICAgIHJvbGx1cE9wdGlvbnMuZXh0ZXJuYWwgPSBPYmplY3Qua2V5cygnZGVwZW5kZW5jaWVzJyBpbiBwa2cgPyBwa2cuZGVwZW5kZW5jaWVzIDoge30pO1xuXG4gICAgcmVzdWx0LnBsdWdpbnMucHVzaChlbGVjdHJvbihbXG5cbiAgICAgIHtcblxuICAgICAgICAvLyBNYWluLVByb2Nlc3MgZW50cnkgZmlsZSBvZiB0aGUgRWxlY3Ryb24gQXBwLlxuICAgICAgICBlbnRyeTogJ2VsZWN0cm9uL21haW4vaW5kZXgudHMnLFxuXG4gICAgICAgIG9uc3RhcnQob3B0aW9ucykge1xuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5WU0NPREVfREVCVUcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKC8qIEZvciBgLnZzY29kZS8uZGVidWcuc2NyaXB0Lm1qc2AgKi8nW3N0YXJ0dXBdIFt2c2NvZGVdIERlYnVnIGVsZWN0cm9uIGFwcCcpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9wdGlvbnMuc3RhcnR1cCgpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHZpdGU6IHtcbiAgICAgICAgICBkZWZpbmU6IHJlc3VsdC5kZWZpbmUsXG4gICAgICAgICAgcmVzb2x2ZTogcmVzdWx0LnJlc29sdmUsXG4gICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIHNvdXJjZW1hcCxcbiAgICAgICAgICAgIG1pbmlmeTogaXNCdWlsZCxcbiAgICAgICAgICAgIG91dERpcjogJ2Rpc3QtZWxlY3Ryb24vbWFpbicsXG4gICAgICAgICAgICByb2xsdXBPcHRpb25zLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG5cbiAgICAgIH0sXG5cbiAgICAgIHtcblxuICAgICAgICBlbnRyeTogJ2VsZWN0cm9uL3ByZWxvYWQvaW5kZXgudHMnLFxuXG4gICAgICAgIG9uc3RhcnQob3B0aW9ucykge1xuICAgICAgICAgIC8vIE5vdGlmeSB0aGUgUmVuZGVyZXItUHJvY2VzcyB0byByZWxvYWQgdGhlIHBhZ2Ugd2hlbiB0aGUgUHJlbG9hZC1TY3JpcHRzIGJ1aWxkIGlzIGNvbXBsZXRlLCBcbiAgICAgICAgICAvLyBpbnN0ZWFkIG9mIHJlc3RhcnRpbmcgdGhlIGVudGlyZSBFbGVjdHJvbiBBcHAuXG4gICAgICAgICAgb3B0aW9ucy5yZWxvYWQoKVxuICAgICAgICB9LFxuXG4gICAgICAgIHZpdGU6IHtcbiAgICAgICAgICBkZWZpbmU6IHJlc3VsdC5kZWZpbmUsXG4gICAgICAgICAgcmVzb2x2ZTogcmVzdWx0LnJlc29sdmUsXG4gICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgIHNvdXJjZW1hcDogc291cmNlbWFwID8gJ2lubGluZScgOiB1bmRlZmluZWQsIC8vICMzMzJcbiAgICAgICAgICAgIG1pbmlmeTogaXNCdWlsZCxcbiAgICAgICAgICAgIG91dERpcjogJ2Rpc3QtZWxlY3Ryb24vcHJlbG9hZCcsXG4gICAgICAgICAgICByb2xsdXBPcHRpb25zLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG5cbiAgICAgIH1cblxuICAgIF0pKTtcblxuICB9XG5cbiAgLy8gTm9ybWFsXG4gIGVsc2Uge1xuXG4gICAgcmVzdWx0LmFwcFR5cGUgPSAnc3BhJztcbiAgICByZXN1bHQuYmFzZSA9ICcnO1xuXG4gICAgcmVzdWx0LmJ1aWxkID0ge1xuICAgICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICBjb3B5UHVibGljRGlyOiB0cnVlLFxuICAgICAgcm9sbHVwT3B0aW9uc1xuICAgIH07XG5cbiAgfVxuXG4gIC8vIENvbXBsZXRlXG4gIHJldHVybiByZXN1bHQ7XG5cbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwicG9ueS1ob3VzZS1tYXRyaXhcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4zLjQwXCIsXG4gIFwic2hvcnRfbmFtZVwiOiBcIlBvbnkgSG91c2VcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlRoZSBvcGVuIHNvdXJjZSBob3VzZSwgeW91ciBob3VzZSwgdGhlIGhvdXNlIGZvciBhbGwgbWF0cml4IHBvbmllc1wiLFxuICBcIm1haW5cIjogXCJkaXN0LWVsZWN0cm9uL21haW4vaW5kZXguanNcIixcbiAgXCJlbmdpbmVzXCI6IHtcbiAgICBcIm5vZGVcIjogXCI+PTIwLjAuMFwiXG4gIH0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJzdGFydFwiOiBcImdpdCBzdWJtb2R1bGUgdXBkYXRlIC0taW5pdCAmJiB2aXRlIGRldlwiLFxuICAgIFwiYnVpbGRcIjogXCJnaXQgc3VibW9kdWxlIHVwZGF0ZSAtLWluaXQgJiYgdml0ZSBidWlsZFwiLFxuICAgIFwiYnVpbGQ6OGdiXCI6IFwiZ2l0IHN1Ym1vZHVsZSB1cGRhdGUgLS1pbml0ICYmIGNyb3NzLWVudiBOT0RFX09QVElPTlM9LS1tYXgtb2xkLXNwYWNlLXNpemU9ODE5MiB2aXRlIGJ1aWxkXCIsXG4gICAgXCJlbGVjdHJvbjpzdGFydFwiOiBcImdpdCBzdWJtb2R1bGUgdXBkYXRlIC0taW5pdCAmJiBjcm9zcy1lbnYgRUxFQ1RST05fTU9ERT10cnVlIHZpdGUgZGV2XCIsXG4gICAgXCJlbGVjdHJvbjpidWlsZFwiOiBcImdpdCBzdWJtb2R1bGUgdXBkYXRlIC0taW5pdCAmJiBjcm9zcy1lbnYgRUxFQ1RST05fTU9ERT10cnVlIHZpdGUgYnVpbGQgJiYgZWxlY3Ryb24tYnVpbGRlclwiLFxuICAgIFwibGludFwiOiBcInlhcm4gY2hlY2s6ZXNsaW50ICYmIHlhcm4gY2hlY2s6cHJldHRpZXJcIixcbiAgICBcImNoZWNrOmVzbGludFwiOiBcImVzbGludCBzcmMvKiAmJiBlc2xpbnQgZWxlY3Ryb24vKiAmJiBlc2xpbnQgbW9kcy8qIC0tbm8tZXJyb3Itb24tdW5tYXRjaGVkLXBhdHRlcm5cIixcbiAgICBcImNoZWNrOnByZXR0aWVyXCI6IFwicHJldHRpZXIgLS1jaGVjayBzcmMvKiAmJiBwcmV0dGllciAtLWNoZWNrIGVsZWN0cm9uLyogJiYgcHJldHRpZXIgLS1jaGVjayBtb2RzLypcIixcbiAgICBcImZpeDpwcmV0dGllclwiOiBcInByZXR0aWVyIC0td3JpdGUgc3JjLyogJiYgcHJldHRpZXIgLS13cml0ZSBlbGVjdHJvbi8qICYmIHByZXR0aWVyIC0td3JpdGUgbW9kcy8qXCIsXG4gICAgXCJmaXg6c3JjOnByZXR0aWVyXCI6IFwicHJldHRpZXIgLS13cml0ZSBzcmMvKlwiLFxuICAgIFwiZml4OmVsZWN0cm9uOnByZXR0aWVyXCI6IFwicHJldHRpZXIgLS13cml0ZSBlbGVjdHJvbi8qXCIsXG4gICAgXCJmaXg6bW9kczpwcmV0dGllclwiOiBcInByZXR0aWVyIC0td3JpdGUgbW9kcy8qXCIsXG4gICAgXCJwdWJsaWM6Y2hlY2s6ZXNsaW50XCI6IFwiZXNsaW50IHB1YmxpYy8qXCIsXG4gICAgXCJwdWJsaWM6Y2hlY2s6cHJldHRpZXJcIjogXCJwcmV0dGllciAtLWNoZWNrIHB1YmxpYy8qXCIsXG4gICAgXCJwdWJsaWM6Zml4OnByZXR0aWVyXCI6IFwicHJldHRpZXIgLS13cml0ZSBwdWJsaWMvKlwiXG4gIH0sXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwicmVhY3RcIixcbiAgICBcImphdmFzY3JpcHRcIixcbiAgICBcIndlYnNpdGVcIixcbiAgICBcIm1hdHJpeFwiLFxuICAgIFwicG9ueVwiLFxuICAgIFwibWF0cml4LWNsaWVudFwiLFxuICAgIFwiYnJvbnlcIixcbiAgICBcImJyb255LWZhbmRvbVwiLFxuICAgIFwicG9ueS1ob3VzZVwiXG4gIF0sXG4gIFwiYXV0aG9yXCI6IHtcbiAgICBcIm5hbWVcIjogXCJKYXNtaW5EcmVhc29uZCAoWWFzbWluIFNlaWRlbClcIixcbiAgICBcImVtYWlsXCI6IFwidGlueUBwdWRkeS5jbHViXCIsXG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vSmFzbWluRHJlYXNvbmRcIlxuICB9LFxuICBcImxpY2Vuc2VcIjogXCJBR1BMLTMuMC1vbmx5XCIsXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBjcnlwdG9mb250cy9jcnlwdG9mb250XCI6IFwiMS4zLjVcIixcbiAgICBcIkBmb3J0YXdlc29tZS9mb250YXdlc29tZS1mcmVlXCI6IFwiNi41LjJcIixcbiAgICBcIkBraGFuYWNhZGVteS9zaW1wbGUtbWFya2Rvd25cIjogXCIwLjExLjRcIixcbiAgICBcIkBtYXRyaXgtb3JnL29sbVwiOiBcIjMuMi4xNVwiLFxuICAgIFwiQHRpcHB5anMvcmVhY3RcIjogXCI0LjIuNlwiLFxuICAgIFwiQHhtdHAveG10cC1qc1wiOiBcIjExLjUuMFwiLFxuICAgIFwiYXV0by1sYXVuY2hcIjogXCI1LjAuNlwiLFxuICAgIFwiYmx1cmhhc2hcIjogXCIyLjAuNVwiLFxuICAgIFwiYm9vdHN0cmFwXCI6IFwiNS4zLjNcIixcbiAgICBcImJvb3RzdHJhcC1pY29uc1wiOiBcIjEuMTEuM1wiLFxuICAgIFwiYnVmZmVyXCI6IFwiNi4wLjNcIixcbiAgICBcImNob2tpZGFyXCI6IFwiMy42LjBcIixcbiAgICBcImNpZC10b29sXCI6IFwiMy4wLjBcIixcbiAgICBcImNsb25lXCI6IFwiMi4xLjJcIixcbiAgICBcImNvbXBhcmUtdmVyc2lvbnNcIjogXCI2LjEuMFwiLFxuICAgIFwiZW1vamliYXNlLWRhdGFcIjogXCI3LjAuMVwiLFxuICAgIFwiZXRoLXByb3ZpZGVyXCI6IFwiMC4xMy42XCIsXG4gICAgXCJldGhlcnNcIjogXCI2LjExLjFcIixcbiAgICBcImZpbGUtc2F2ZXJcIjogXCIyLjAuNVwiLFxuICAgIFwiZmx1eFwiOiBcIjQuMC40XCIsXG4gICAgXCJmb3JtaWtcIjogXCIyLjQuNVwiLFxuICAgIFwiZnJlZXplZnJhbWVcIjogXCI1LjAuMlwiLFxuICAgIFwiZ2VuZXJhdGUtYXBpLWtleVwiOiBcIjEuMC4yXCIsXG4gICAgXCJoaWdobGlnaHQuanNcIjogXCIxMS45LjBcIixcbiAgICBcImh0bWwtcmVhY3QtcGFyc2VyXCI6IFwiNS4xLjEwXCIsXG4gICAgXCJpcGFkZHIuanNcIjogXCIyLjEuMFwiLFxuICAgIFwianF1ZXJ5XCI6IFwiMy43LjFcIixcbiAgICBcImpxdWVyeS11aVwiOiBcIjEuMTMuMlwiLFxuICAgIFwia2F0ZXhcIjogXCIwLjE2LjEwXCIsXG4gICAgXCJsaW5raWZ5LWh0bWxcIjogXCI0LjEuM1wiLFxuICAgIFwibGlua2lmeS1wbHVnaW4ta2V5d29yZFwiOiBcIjQuMS4zXCIsXG4gICAgXCJsaW5raWZ5LXJlYWN0XCI6IFwiNC4xLjNcIixcbiAgICBcImxpbmtpZnlqc1wiOiBcIjQuMS4zXCIsXG4gICAgXCJtYXRyaXgtZW5jcnlwdC1hdHRhY2htZW50XCI6IFwiMS4wLjNcIixcbiAgICBcIm1hdHJpeC1qcy1zZGtcIjogXCIzMi4wLjBcIixcbiAgICBcIm1kNVwiOiBcIjIuMy4wXCIsXG4gICAgXCJtb21lbnQtdGltZXpvbmVcIjogXCIwLjUuNDVcIixcbiAgICBcIm5hdGl2ZS1ub2RlLWRuc1wiOiBcIjAuNy42XCIsXG4gICAgXCJub2RlLWZldGNoXCI6IFwiMlwiLFxuICAgIFwib2JqZWN0LWhhc2hcIjogXCIzLjAuMFwiLFxuICAgIFwicGhvdG9zd2lwZVwiOiBcIjUuNC4zXCIsXG4gICAgXCJwcm9wLXR5cGVzXCI6IFwiMTUuOC4xXCIsXG4gICAgXCJxcmNvZGVcIjogXCIxLjUuM1wiLFxuICAgIFwicmVhY3RcIjogXCIxOC4yLjBcIixcbiAgICBcInJlYWN0LWF1dG9zaXplLXRleHRhcmVhXCI6IFwiNy4xLjBcIixcbiAgICBcInJlYWN0LWJsdXJoYXNoXCI6IFwiMC4zLjBcIixcbiAgICBcInJlYWN0LWJvb3RzdHJhcFwiOiBcIjIuMTAuMlwiLFxuICAgIFwicmVhY3QtZG5kXCI6IFwiMTYuMC4xXCIsXG4gICAgXCJyZWFjdC1kbmQtaHRtbDUtYmFja2VuZFwiOiBcIjE2LjAuMVwiLFxuICAgIFwicmVhY3QtZG9tXCI6IFwiMTguMi4wXCIsXG4gICAgXCJyZWFjdC1nb29nbGUtcmVjYXB0Y2hhXCI6IFwiMy4xLjBcIixcbiAgICBcInNhbml0aXplLWh0bWxcIjogXCIyLjEzLjBcIixcbiAgICBcInNsYXRlXCI6IFwiMC4xMDIuMFwiLFxuICAgIFwic2xhdGUtaGlzdG9yeVwiOiBcIjAuMTAwLjBcIixcbiAgICBcInNsYXRlLXJlYWN0XCI6IFwiMC4xMDIuMFwiLFxuICAgIFwidGlwcHkuanNcIjogXCI2LjMuN1wiLFxuICAgIFwidHdlbW9qaVwiOiBcIjE0LjAuMlwiLFxuICAgIFwid2ViMy1wcm92aWRlcnMtd3NcIjogXCI0LjAuN1wiLFxuICAgIFwieWpzXCI6IFwiMTMuNi4xNFwiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBlc2J1aWxkLXBsdWdpbnMvbm9kZS1nbG9iYWxzLXBvbHlmaWxsXCI6IFwiMC4yLjNcIixcbiAgICBcIkByb2xsdXAvcGx1Z2luLWluamVjdFwiOiBcIjUuMC41XCIsXG4gICAgXCJAcm9sbHVwL3BsdWdpbi13YXNtXCI6IFwiNi4yLjJcIixcbiAgICBcIkB0eXBlcy9ub2RlXCI6IFwiMjAuMTIuN1wiLFxuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiMTguMi43OVwiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIjE4LjIuMjVcIixcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9lc2xpbnQtcGx1Z2luXCI6IFwiNy43LjBcIixcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9wYXJzZXJcIjogXCI3LjcuMFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjogXCI0LjIuMVwiLFxuICAgIFwiY3Jvc3MtZW52XCI6IFwiNy4wLjNcIixcbiAgICBcImRvd25sb2FkLWdpdC1yZXBvXCI6IFwiMy4wLjJcIixcbiAgICBcImVsZWN0cm9uXCI6IFwiXjMwLjAuMFwiLFxuICAgIFwiZWxlY3Ryb24tYnVpbGRlclwiOiBcIl4yNC45LjFcIixcbiAgICBcImVzbGludFwiOiBcIjkuMC4wXCIsXG4gICAgXCJlc2xpbnQtY29uZmlnLWFpcmJuYlwiOiBcIjE5LjAuNFwiLFxuICAgIFwiZXNsaW50LWNvbmZpZy1wcmV0dGllclwiOiBcIjkuMS4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLWltcG9ydFwiOiBcIjIuMjkuMVwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1qc3gtYTExeVwiOiBcIjYuOC4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0XCI6IFwiNy4zNC4xXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXJlYWN0LWhvb2tzXCI6IFwiNC42LjBcIixcbiAgICBcImVzbVwiOiBcIl4zLjIuMjVcIixcbiAgICBcImZzLWV4dHJhXCI6IFwiXjExLjEuMVwiLFxuICAgIFwicHJldHRpZXJcIjogXCIzLjIuNVwiLFxuICAgIFwic2Fzc1wiOiBcIjEuNzUuMFwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIjUuNC41XCIsXG4gICAgXCJ2aXRlXCI6IFwiNS4yLjhcIixcbiAgICBcInZpdGUtcGx1Z2luLWVsZWN0cm9uXCI6IFwiXjAuMjguNFwiLFxuICAgIFwidml0ZS1wbHVnaW4tZWxlY3Ryb24tcmVuZGVyZXJcIjogXCJeMC4xNC41XCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1zdGF0aWMtY29weVwiOiBcIjEuMC4yXCJcbiAgfSxcbiAgXCJwcml2YXRlXCI6IHRydWVcbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJaLFNBQVMsY0FBYyxlQUFlO0FBQ2pjLE9BQU8sV0FBVztBQUNsQixTQUFTLFlBQVk7QUFDckIsU0FBUyxzQkFBc0I7QUFDL0IsU0FBUyxpQ0FBaUM7QUFDMUMsT0FBTyxZQUFZO0FBRW5CLE9BQU8sUUFBUTtBQUNmLE9BQU8sVUFBVTtBQUVqQixTQUFTLHFCQUFxQjtBQUU5QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxjQUFjOzs7QUNickI7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLFlBQWM7QUFBQSxFQUNkLGFBQWU7QUFBQSxFQUNmLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxJQUNULE1BQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxTQUFXO0FBQUEsSUFDVCxPQUFTO0FBQUEsSUFDVCxPQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixrQkFBa0I7QUFBQSxJQUNsQixrQkFBa0I7QUFBQSxJQUNsQixNQUFRO0FBQUEsSUFDUixnQkFBZ0I7QUFBQSxJQUNoQixrQkFBa0I7QUFBQSxJQUNsQixnQkFBZ0I7QUFBQSxJQUNoQixvQkFBb0I7QUFBQSxJQUNwQix5QkFBeUI7QUFBQSxJQUN6QixxQkFBcUI7QUFBQSxJQUNyQix1QkFBdUI7QUFBQSxJQUN2Qix5QkFBeUI7QUFBQSxJQUN6Qix1QkFBdUI7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsVUFBWTtBQUFBLElBQ1Y7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVU7QUFBQSxJQUNSLE1BQVE7QUFBQSxJQUNSLE9BQVM7QUFBQSxJQUNULEtBQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxTQUFXO0FBQUEsRUFDWCxjQUFnQjtBQUFBLElBQ2QsMkJBQTJCO0FBQUEsSUFDM0IsaUNBQWlDO0FBQUEsSUFDakMsZ0NBQWdDO0FBQUEsSUFDaEMsbUJBQW1CO0FBQUEsSUFDbkIsa0JBQWtCO0FBQUEsSUFDbEIsaUJBQWlCO0FBQUEsSUFDakIsZUFBZTtBQUFBLElBQ2YsVUFBWTtBQUFBLElBQ1osV0FBYTtBQUFBLElBQ2IsbUJBQW1CO0FBQUEsSUFDbkIsUUFBVTtBQUFBLElBQ1YsVUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLElBQ1osT0FBUztBQUFBLElBQ1Qsb0JBQW9CO0FBQUEsSUFDcEIsa0JBQWtCO0FBQUEsSUFDbEIsZ0JBQWdCO0FBQUEsSUFDaEIsUUFBVTtBQUFBLElBQ1YsY0FBYztBQUFBLElBQ2QsTUFBUTtBQUFBLElBQ1IsUUFBVTtBQUFBLElBQ1YsYUFBZTtBQUFBLElBQ2Ysb0JBQW9CO0FBQUEsSUFDcEIsZ0JBQWdCO0FBQUEsSUFDaEIscUJBQXFCO0FBQUEsSUFDckIsYUFBYTtBQUFBLElBQ2IsUUFBVTtBQUFBLElBQ1YsYUFBYTtBQUFBLElBQ2IsT0FBUztBQUFBLElBQ1QsZ0JBQWdCO0FBQUEsSUFDaEIsMEJBQTBCO0FBQUEsSUFDMUIsaUJBQWlCO0FBQUEsSUFDakIsV0FBYTtBQUFBLElBQ2IsNkJBQTZCO0FBQUEsSUFDN0IsaUJBQWlCO0FBQUEsSUFDakIsS0FBTztBQUFBLElBQ1AsbUJBQW1CO0FBQUEsSUFDbkIsbUJBQW1CO0FBQUEsSUFDbkIsY0FBYztBQUFBLElBQ2QsZUFBZTtBQUFBLElBQ2YsWUFBYztBQUFBLElBQ2QsY0FBYztBQUFBLElBQ2QsUUFBVTtBQUFBLElBQ1YsT0FBUztBQUFBLElBQ1QsMkJBQTJCO0FBQUEsSUFDM0Isa0JBQWtCO0FBQUEsSUFDbEIsbUJBQW1CO0FBQUEsSUFDbkIsYUFBYTtBQUFBLElBQ2IsMkJBQTJCO0FBQUEsSUFDM0IsYUFBYTtBQUFBLElBQ2IsMEJBQTBCO0FBQUEsSUFDMUIsaUJBQWlCO0FBQUEsSUFDakIsT0FBUztBQUFBLElBQ1QsaUJBQWlCO0FBQUEsSUFDakIs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
