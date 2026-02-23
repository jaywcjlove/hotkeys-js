import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { readFileSync } from "fs";
import terser from "@rollup/plugin-terser";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

// Generate banner
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * 
 * @author ${pkg.author}
 * @license ${pkg.license}
 * @homepage ${pkg.homepage}
 */`;

export default defineConfig({
  publicDir: false,
  plugins: [dts({ rollupTypes: true, tsconfigPath: "./tsconfig.json" })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "hotkeys",
    },
    rollupOptions: {
      output: [
        {
          format: "es",
          banner,
          entryFileNames: "hotkeys-js.js",
        },
        {
          format: "umd",
          banner,
          entryFileNames: "hotkeys-js.umd.cjs",
          name: "hotkeys",
          footer: `
// CommonJS compatibility
if (typeof module === "object" && module.exports) {
  module.exports.default = module.exports;
}
// AMD compatibility  
if (typeof define === "function" && define.amd) {
  define([], function() { return hotkeys; });
}`,
        },
        {
          format: "iife",
          banner,
          entryFileNames: "hotkeys-js.min.js",
          name: "hotkeys",
          plugins: [terser()], // 仅对 IIFE 格式进行压缩
        },
      ],
    },
    minify: false,
    sourcemap: true,
    target: "es2015",
    emptyOutDir: false, // Don't empty the output directory
  },
});
