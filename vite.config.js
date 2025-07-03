import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"
import dynamicImport from "vite-plugin-dynamic-import"
import vitePluginRequire from "vite-plugin-require"
import svgr from "vite-plugin-svgr"
import fs from "node:fs"
import commonjs from "vite-plugin-commonjs"
import viteCompression from "vite-plugin-compression"
// import { VitePWA } from "vite-plugin-pwa"
import { GlobSync } from "glob"
import legacy from "@vitejs/plugin-legacy"
import { replaceCodePlugin } from "vite-plugin-replace"

export default defineConfig(({ mode }) => {
  // server端env更新并不及时，请重启伺服器
  Object.assign(process.env, loadEnv(mode, process.cwd()))

  return {
    base: "/web",
    build: {
      outDir: "web",
      target: ["es2015", "safari12"],
      rollupOptions: {
        output: {
          manualChunks: {
            lodash: ["lodash"],
            jquery: ["jquery"],
            rxjs: ["rxjs"],
            onsenui: ["onsenui"],
            react: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    esbuild: {
      loader: "tsx",
      include: /src\/.*\.(jsx?|tsx?)$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: "load-js-files-as-jsx",
            setup(build) {
              build.onLoad({ filter: /src\/.*\.js$/ }, async (args) => {
                return {
                  loader: "jsx",
                  contents: await fs.readFile(args.path, "utf8"),
                }
              })
            },
          },
        ],
      },
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
    },
    plugins: [
      react({
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
          ],
        },
      }),
      dynamicImport(),
      vitePluginRequire(),
      svgr({ exportAsDefault: true }),
      commonjs(),
      viteCompression(),
      legacy({
        targets: ["defaults", "ie 11"],
        additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      }),
      replaceCodePlugin({
        replacements: [
          process.env.VITE_LAZY_LOAD !== "true"
            ? {
              from: "const modules = {}",
              to: `const modules = import.meta.glob("./pages/**/index.{js,jsx,tsx}", {
                    import: "default",
                    eager: true,
                  })`,
            }
            : null,
        ].filter((x) => x),
      }),
    ],
    server: {
      open: "/web/",
      // headers: {
      //   "Cross-Origin-Opener-Policy": "same-origin",
      //   "Cross-Origin-Embedder-Policy": "require-corp",
      // },
    },
    define: {
      __PAGES_ROUTES__: GlobSync("src/pages/**/index.{js,jsx,tsx}").found.map((x) => x.replace(/src\/pages\/(.*)\/index\.(jsx?|tsx)/, "$1")),
    },
  }
})
