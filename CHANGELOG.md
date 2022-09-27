# Changelog

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
