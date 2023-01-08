#!/usr/bin/env tnode
import { readFileSync, writeFileSync } from "node:fs";
import * as colors from "picocolors";
import { ask, getPackageJSON, main, run } from "./utils";

main(async () => {
  run("pnpm i --loglevel error");
  const packageJSON = getPackageJSON();
  const changelog = readFileSync("CHANGELOG.md", "utf-8");
  if (!changelog.includes("## Unreleased")) {
    throw new Error("Can't find '## Unreleased' section in CHANGELOG.md");
  }

  console.log(colors.cyan("Changelog:"));
  const index = changelog.indexOf("## Unreleased") + 13;
  console.log(
    colors.dim(changelog.slice(index, changelog.indexOf("## ", index)).trim()),
  );

  console.log(
    colors.cyan("Current version: ") + colors.magenta(packageJSON.version),
  );
  const newVersion = (await ask(colors.cyan(`New version: `))).trim();
  if (!newVersion) throw new Error("No version provided");

  console.log(colors.dim("Write package.json & CHANGELOG.md"));
  packageJSON.version = newVersion;
  writeFileSync("package.json", JSON.stringify(packageJSON, null, 2) + "\n");
  writeFileSync(
    "CHANGELOG.md",
    changelog.replace("## Unreleased", `## Unreleased\n\n## ${newVersion}`),
  );

  run(`git commit -am "release: v${newVersion}"`);
  run(`git tag v${newVersion}`);
  run("git push --tags");
});
