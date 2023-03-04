import { expect, test } from "@playwright/test";
import { setupDevServer, setupBuildAndPreview } from "../../utils";

test("Decorators-jsx build", async ({ page }) => {
  const { testUrl, server } = await setupBuildAndPreview("decorators-jsx");
  await page.goto(testUrl);

  await expect(page.locator("body")).toHaveText("Hello World");

  await server.httpServer.close();
});

test("Decorators-jsx dev", async ({ page }) => {
  const { testUrl, server } = await setupDevServer("decorators-jsx");
  await page.goto(testUrl);

  await expect(page.locator("body")).toHaveText("Hello World");

  await server.close();
});
