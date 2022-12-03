import { devices, PlaywrightTestConfig } from "@playwright/test";
import { resolve } from "node:path";
import * as fs from "fs-extra";

const tempDir = resolve(__dirname, "playground-temp");
fs.ensureDirSync(tempDir);
fs.emptyDirSync(tempDir);
fs.copySync(resolve(__dirname, "playground"), tempDir);

const config: PlaywrightTestConfig = {
  testDir: "./tests",
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
  webServer: {
    cwd: "playground-temp",
    command: "pnpm dev",
    port: 5173,
  },
};

export default config;
