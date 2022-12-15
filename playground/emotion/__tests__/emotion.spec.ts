import { expect, test } from "@playwright/test";
import {
  setupDevServer,
  setupBuildAndPreview,
  setupWaitForLogs,
  rgbToHex,
} from "../../utils";

test("Emotion build", async ({ page }) => {
  const { testUrl, server } = await setupBuildAndPreview("emotion");
  await page.goto(testUrl);

  const button = page.locator("button");
  await button.hover();
  await expect(
    rgbToHex(await button.evaluate((el) => getComputedStyle(el).color)),
  ).toBe("#646cff");

  await button.click();
  await expect(button).toHaveText("count is 1");

  await server.httpServer.close();
});

test("Emotion HMR", async ({ page }) => {
  const { testUrl, server, editFile } = await setupDevServer("emotion");
  const waitForLogs = await setupWaitForLogs(page);
  await page.goto(testUrl);
  await waitForLogs("[vite] connected.");

  const button = page.locator("button");
  await button.hover();
  await expect(
    rgbToHex(await button.evaluate((el) => getComputedStyle(el).color)),
  ).toBe("#646cff");

  await button.click();
  await expect(button).toHaveText("count is 1");

  editFile("src/Button.tsx", [
    "background-color: #d26ac2;",
    "background-color: #646cff;",
  ]);
  await waitForLogs("[vite] hot updated: /src/Button.tsx");
  await expect(button).toHaveText("count is 1");
  await expect(
    rgbToHex(
      await button.evaluate((el) => getComputedStyle(el).backgroundColor),
    ),
  ).toBe("#646cff");

  editFile("src/App.tsx", ['color="#646cff"', 'color="#d26ac2"']);
  await waitForLogs("[vite] hot updated: /src/App.tsx");
  await expect(button).toHaveText("count is 1");
  await expect(
    rgbToHex(await button.evaluate((el) => getComputedStyle(el).color)),
  ).toBe("#d26ac2");

  await server.close();
});
