import { expect, test } from "@playwright/test";
import { setupDevServer } from "../../utils";

test("Shadow export HMR", async ({ page }) => {
  const { testUrl, server, editFile } = await setupDevServer("shadow-export");
  await page.goto(testUrl);

  editFile("src/App.tsx", ["Shadow export", "Shadow export updates!"]);
  await expect(page.locator("body")).toHaveText("Shadow export updates!");

  await server.close();
});
