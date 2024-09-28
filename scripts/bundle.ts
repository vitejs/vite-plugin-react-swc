import { rmSync, writeFileSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { build, BuildOptions, context } from "esbuild";

import packageJSON from "../package.json";

const dev = process.argv.includes("--dev");

rmSync("dist", { force: true, recursive: true });

const serverOptions: BuildOptions = {
  bundle: true,
  platform: "node",
  target: "node14",
  legalComments: "inline",
  external: Object.keys(packageJSON.peerDependencies).concat(
    Object.keys(packageJSON.dependencies),
  ),
};

const buildOrWatch = async (options: BuildOptions) => {
  if (!dev) return build(options);
  const ctx = await context(options);
  await ctx.watch();
  await ctx.rebuild();
};

Promise.all([
  buildOrWatch({
    entryPoints: ["src/refresh-runtime.js"],
    outdir: "dist",
    platform: "browser",
    format: "esm",
    target: "safari13",
    legalComments: "inline",
  }),
  buildOrWatch({
    ...serverOptions,
    stdin: {
      contents: `import react from "./src";
module.exports = react;
// For backward compatibility with the first broken version
module.exports.default = react;`,
      resolveDir: ".",
    },
    outfile: "dist/index.cjs",
    logOverride: { "empty-import-meta": "silent" },
  }),
  buildOrWatch({
    ...serverOptions,
    entryPoints: ["src/index.ts"],
    format: "esm",
    outfile: "dist/index.mjs",
  }),
]).then(() => {
  copyFileSync("LICENSE", "dist/LICENSE");
  copyFileSync("README.md", "dist/README.md");

  execSync(
    "tsc src/index.ts --declaration --isolatedDeclarations --noCheck --emitDeclarationOnly --outDir dist --target es2020 --module es2020 --moduleResolution bundler",
    { stdio: "inherit" },
  );

  writeFileSync(
    "dist/package.json",
    JSON.stringify(
      {
        name: "@vitejs/plugin-react-swc",
        description: "Speed up your Vite dev server with SWC",
        version: packageJSON.version,
        author: "Arnaud Barré (https://github.com/ArnaudBarre)",
        license: "MIT",
        repository: "github:vitejs/vite-plugin-react-swc",
        type: "module",
        main: "index.cjs",
        types: "index.d.ts",
        module: "index.mjs",
        exports: {
          ".": {
            types: "./index.d.ts",
            require: "./index.cjs",
            import: "./index.mjs",
          },
        },
        keywords: [
          "vite",
          "vite-plugin",
          "react",
          "swc",
          "react-refresh",
          "fast refresh",
        ],
        peerDependencies: packageJSON.peerDependencies,
        dependencies: packageJSON.dependencies,
      },
      null,
      2,
    ),
  );
});
