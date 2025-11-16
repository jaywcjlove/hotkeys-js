import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { readFileSync } from "fs";

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
      formats: ["es", "umd", "iife"],
      fileName: (format) => {
        if (format === "es") return "hotkeys-js.js";
        if (format === "umd") return "hotkeys-js.umd.cjs";
        if (format === "iife") return "hotkeys-js.min.js";
        return `hotkeys-js.${format}.js`;
      },
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
        },
        {
          format: "iife",
          banner,
          entryFileNames: "hotkeys-js.min.js",
          name: "hotkeys",
          compact: true, // UMD 格式进行压缩
        },
      ],
    },
    minify: true,
    sourcemap: true,
    target: "es2015",
  },
});
