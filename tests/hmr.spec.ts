import { test, expect } from "@playwright/test";
import { readFileSync, writeFileSync } from "fs";

test("HMR invalidate", async ({ page }) => {
  let logs: string[] = [];
  page.on("console", (log) => {
    logs.push(log.text());
  });
  const waitForLogs = (...messages: string[]) =>
    expect
      .poll(() => {
        if (messages.every((m) => logs.includes(m))) {
          logs = [];
          return true;
        }
        return logs;
      })
      .toBe(true);

  await page.goto("http://localhost:5173");
  await waitForLogs("[vite] connected.");

  await page.click("button");
  await expect(page.locator("button")).toHaveText("count is 1");

  editFile("App.tsx", ["{count}", "{count}!"]);
  await waitForLogs("[vite] hot updated: /src/App.tsx");
  await expect(page.locator("button")).toHaveText("count is 1!");

  // Edit component
  editFile("TitleWithExport.tsx", ["Vite +", "Vite *"]);
  await waitForLogs("[vite] hot updated: /src/TitleWithExport.tsx");

  // Edit export
  editFile("TitleWithExport.tsx", ["React", "React!"]);
  await waitForLogs(
    "[vite] invalidate /src/TitleWithExport.tsx: Could not Fast Refresh. Learn more at https://github.com/vitejs/plugin-react-swc#consistent-components-exports",
    "[vite] hot updated: /src/App.tsx",
  );
  await expect(page.locator("h1")).toHaveText("Vite * React!");

  // Add non-component export
  editFile("TitleWithExport.tsx", [
    'React!";',
    'React!";\nexport const useless = 3;',
  ]);
  await waitForLogs(
    "[vite] invalidate /src/TitleWithExport.tsx: Could not Fast Refresh. Learn more at https://github.com/vitejs/plugin-react-swc#consistent-components-exports",
    "[vite] hot updated: /src/App.tsx",
  );

  // Add component export
  editFile("TitleWithExport.tsx", [
    "</h1>;",
    "</h1>;\nexport const Title2 = () => <h2>Title2</h2>;",
  ]);
  await waitForLogs("[vite] hot updated: /src/TitleWithExport.tsx");

  // Import new component
  editFile(
    "App.tsx",
    ["import { TitleWithExport", "import { TitleWithExport, Title2"],
    ["<TitleWithExport />", "<TitleWithExport /> <Title2 />"],
  );
  await waitForLogs("[vite] hot updated: /src/App.tsx");
  await expect(page.locator("h2")).toHaveText("Title2");

  // Remove component export
  editFile("TitleWithExport.tsx", [
    "\nexport const Title2 = () => <h2>Title2</h2>;",
    "",
  ]);
  await waitForLogs(
    "[vite] invalidate /src/TitleWithExport.tsx: Could not Fast Refresh (export removed)",
    "[vite] hot updated: /src/App.tsx",
    "[hmr] Failed to reload /src/App.tsx. This could be due to syntax errors or importing non-existent modules. (see errors above)",
  );

  // Remove usage from App
  editFile(
    "App.tsx",
    ["import { TitleWithExport, Title2", "import { TitleWithExport"],
    ["<TitleWithExport /> <Title2 />", "<TitleWithExport />"],
  );
  await waitForLogs("[vite] hot updated: /src/App.tsx");
  await expect(page.locator("button")).toHaveText("count is 1!");

  // Remove useless export
  editFile("TitleWithExport.tsx", ["\nexport const useless = 3;", ""]);
  await waitForLogs(
    "[vite] invalidate /src/TitleWithExport.tsx: Could not Fast Refresh (export removed)",
    "[vite] hot updated: /src/App.tsx",
  );
});

const editFile = (
  name: string,
  ...replacements: [searchValue: string, replaceValue: string][]
) => {
  const path = `playground-temp/src/${name}`;
  let content = readFileSync(path, "utf-8");
  for (let replacement of replacements) {
    if (!content.includes(replacement[0])) {
      throw new Error(`${replacement[0]} not found in ${name}`);
    }
    content = content.replace(replacement[0], replacement[1]);
  }
  writeFileSync(path, content);
};
