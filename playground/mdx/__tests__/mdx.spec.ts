import { expect, test } from "@playwright/test";
import {
  setupDevServer,
  setupBuildAndPreview,
  setupWaitForLogs,
} from "../../utils.js";

test("MDX build", async ({ page }) => {
  const { testUrl, server } = await setupBuildAndPreview("mdx");
  await page.goto(testUrl);
  await expect(page.getByRole("heading", { name: "Hello" })).toBeVisible();
  await server.httpServer.close();
});

test("MDX HMR", async ({ page }) => {
  const { testUrl, server, editFile } = await setupDevServer("mdx");
  const waitForLogs = await setupWaitForLogs(page);
  await page.goto(testUrl);
  await waitForLogs("[vite] connected.");

  const promise1 = waitForLogs("[vite] hot updated: /src/Counter.tsx");
  editFile("src/Counter.tsx", ["{count}", "{count}!"]);
  await promise1;
  const button = await page.locator("button");
  await button.click();
  await expect(button).toHaveText("count is 1!");

  const promise2 = waitForLogs("[vite] hot updated: /src/hello.mdx");
  editFile("src/hello.mdx", ["Hello", "Hello world"]);
  await promise2;
  await expect(
    page.getByRole("heading", { name: "Hello world" }),
  ).toBeVisible();
  await expect(button).toHaveText("count is 1!");

  await server.close();
});
