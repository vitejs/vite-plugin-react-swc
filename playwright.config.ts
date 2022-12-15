import { devices, PlaywrightTestConfig } from "@playwright/test";
import { resolve } from "node:path";
import * as fs from "fs-extra";

const tempDir = resolve(__dirname, "playground-temp");
fs.ensureDirSync(tempDir);
fs.emptyDirSync(tempDir);
fs.copySync(resolve(__dirname, "playground"), tempDir, {
  filter: (src) =>
    !src.includes("/__tests__") &&
    !src.includes("/.vite") &&
    !src.includes("/dist"),
});

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
};

export default config;
