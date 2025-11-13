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
    },
    rollupOptions: {
      output: {
        banner,
      },
    },
    minify: true,
    sourcemap: true,
    target: "es2015",
  },
});
