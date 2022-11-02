import { readFileSync } from "fs";
import { join, extname } from "path";
import { SourceMapPayload } from "module";
import { Output, ParserConfig, transform } from "@swc/core";
import { PluginOption } from "vite";

const runtimePublicPath = "/@react-refresh";

const preambleCode = `import { injectIntoGlobalHook } from "${runtimePublicPath}";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;`;

const importReactRE = /(^|\n)import\s+(\*\s+as\s+)?React(,|\s+)/;

let define: { [key: string]: string } | undefined;
let automaticRuntime = false;

const parserMap = new Map<string, ParserConfig>([
  [".tsx", { syntax: "typescript", tsx: true }],
  [".ts", { syntax: "typescript", tsx: false }],
  [".jsx", { syntax: "ecmascript", jsx: true }],
  [".js", { syntax: "ecmascript", jsx: false }],
]);

export const swcReactRefresh = (): PluginOption => ({
  name: "swc-react-refresh",
  apply: "serve",
  config: (config) => {
    if (config.esbuild) {
      define = config.esbuild.define;
      automaticRuntime = config.esbuild.jsx === "automatic";
    }
    return automaticRuntime
      ? {
          esbuild: false,
          optimizeDeps: { include: ["react/jsx-dev-runtime"] },
        }
      : { esbuild: false };
  },
  resolveId: (id) => (id === runtimePublicPath ? id : undefined),
  load: (id) =>
    id === runtimePublicPath
      ? readFileSync(join(__dirname, "refresh-runtime.js"), "utf-8")
      : undefined,
  transformIndexHtml: () => [
    { tag: "script", attrs: { type: "module" }, children: preambleCode },
  ],
  async transform(code, id, transformOptions) {
    if (id.includes("node_modules")) return;
    const parser = parserMap.get(extname(id));
    if (!parser) return;

    let result: Output;
    try {
      result = await transform(code, {
        filename: id,
        swcrc: false,
        configFile: false,
        sourceMaps: true,
        jsc: {
          target: "es2020",
          parser,
          transform: {
            react: {
              refresh: !transformOptions?.ssr,
              development: true,
              useBuiltins: true,
              runtime: automaticRuntime ? "automatic" : undefined,
            },
            optimizer: { globals: { vars: define } },
          },
        },
      });
    } catch (e: any) {
      const message: string = e.message;
      const fileStartIndex = message.indexOf("╭─[");
      if (fileStartIndex !== -1) {
        const match = message.slice(fileStartIndex).match(/:(\d+):(\d+)]/);
        if (match) {
          e.line = match[1];
          e.column = match[2];
        }
      }
      throw e;
    }
    let mappingPrefix = "";

    if (
      !automaticRuntime &&
      result.code.includes("React.createElement") &&
      !importReactRE.test(result.code)
    ) {
      result.code = `import React from "react";\n${result.code}`;
      mappingPrefix += ";";
    }

    if (result.code.includes("$RefreshReg$")) {
      mappingPrefix += ";;;;;;;;";
      result.code = `import * as RefreshRuntime from "${runtimePublicPath}";

if (!window.$RefreshReg$) throw new Error("React refresh preamble was not loaded. Something is wrong.");
const prevRefreshReg = window.$RefreshReg$;
const prevRefreshSig = window.$RefreshSig$;
window.$RefreshReg$ = RefreshRuntime.getRefreshReg("${id}");
window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;

${result.code}

window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
import.meta.hot.accept();
RefreshRuntime.enqueueUpdate();
`;
    }

    if (!mappingPrefix) return result;

    const sourceMap: SourceMapPayload = JSON.parse(result.map!);
    sourceMap.mappings = mappingPrefix + sourceMap.mappings;
    return { code: result.code, map: sourceMap };
  },
});
