#!/usr/bin/env tnode
import { readFileSync, writeFileSync } from "node:fs";
import {
  execSync,
  ExecSyncOptionsWithBufferEncoding,
} from "node:child_process";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";
import * as colors from "picocolors";

async function main(): Promise<void> {
  run("pnpm i --loglevel error");
  const packageJSON = JSON.parse(readFileSync("package.json", "utf-8")) as {
    version: string;
  };
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
  run("pnpm build");
  run("npm publish", { cwd: "dist" });
  run("git push --tags");
}

const ask = (question: string) =>
  new Promise<string>((res) =>
    createInterface({ input: stdin, output: stdout }).question(question, res),
  );

const run = (cmd: string, opts?: ExecSyncOptionsWithBufferEncoding) => {
  console.log(colors.dim(`$ ${cmd}`));
  execSync(cmd, { stdio: "inherit", ...opts });
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
