# Changelog

## Unreleased

- Support Emotion via the new `jsxImportSource` option (fixes [#25](https://github.com/vitejs/vite-plugin-react-swc/issues/25))
- Fix HMR when using Vite `base` option (fixes [#18](https://github.com/vitejs/vite-plugin-react-swc/issues/18))
- Fix usage with workers (fixes [#23](https://github.com/vitejs/vite-plugin-react-swc/issues/23))
- Fix usage with `Vite Ruby` and `Laravel Vite` ([#20](https://github.com/vitejs/vite-plugin-react-swc/pull/20))
- Fix plugin default export when using commonjs (fixes [#14](https://github.com/vitejs/vite-plugin-react-swc/issues/14))

## 3.0.0

This is plugin is now stable! 🎉

To migrate from `vite-plugin-swc-react-refresh`, see the `3.0.0-beta.0` changelog.

## 3.0.0-beta.2

- breaking: update plugin name to `vite:react-swc` to match official plugins naming
- fix: don't add React Refresh wrapper for SSR transform (fixes [#11](https://github.com/vitejs/vite-plugin-react-swc/issues/11))

## 3.0.0-beta.1

Fix package.json exports fields

## 3.0.0-beta.0

This is the first beta version of the official plugin for using [SWC](https://swc.rs/) with React in Vite!

Some breaking changes have been made to make the plugin closer to the Babel one while keeping the smallest API surface possible to reduce bugs, encourage future-proof compilation output and allow easier opt-in into future perf improvements (caching, move to other native toolchain, ...):

- Automatically enable automatic JSX runtime. "classic" runtime is not supported
- Skip transformation for `.js` files
- Enforce [useDefineForClassFields](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier)
- Don't pass `esbuild.define` config option to SWC. You can use the [top level define option](https://vitejs.dev/config/shared-options.html#define) instead
- Use default export

To migrate, change your config to:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
});
```

This new release also include a runtime check for React refresh boundaries. When the conditions are not met (most of the time, exporting React components alongside functions or constant), the module is invalidated with a warning message to help you catch issues while keeping you page up-to date with code changes.

## 2.2.1

Skip react-refresh on SSR (Fixes [#2](https://github.com/vitejs/vite-plugin-react-swc/issues/2))

## 2.2.0

- Always provide parser options to fix issue with `.jsx` imports. Relying on file extension for this is more buggy [than I though](https://github.com/swc-project/swc/issues/3297)
- Extract line and column in SWC errors to make overlay filename clickable
- Fix plugin name (`react-refresh` -> `swc-react-refresh`)

## 2.1.0

Add source maps support

## 2.0.3

Include `react/jsx-dev-runtime` for dependencies optimisation when using automatic runtime.

## 2.0.2

Unpinned `@swc/core` to get new features (like TS instantiation expression) despite a [30mb bump of bundle size](https://github.com/swc-project/swc/issues/3899)

## 2.0.1

Fix esbuild property in documentation.

## 2.0.0

Breaking: Use named export instead of default export for better esm/cjs interop.

To migrate, replace your import by `import { swcReactRefresh } from "vite-plugin-swc-react-refresh";`

The JSX automatic runtime is also now supported if you bump esbuild to at least [0.14.51](https://github.com/evanw/esbuild/releases/tag/v0.14.51).

To use it, update your config from `esbuild: { jsxInject: 'import React from "react"' },` to `esbuild: { jsx: "automatic" },`

## 0.1.2

- Add vite as peer dependency
- Pin @swc/core version to 1.2.141 to avoid a 30mb bump of bundle size

## 0.1.1

Add LICENSE

## 0.1.0

Initial release
