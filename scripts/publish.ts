#!/usr/bin/env tnode
import { execSync } from "node:child_process";
import semverLT from "semver/functions/lt";
import * as colors from "picocolors";
import { getPackageJSON, main, run } from "./utils";

main(async () => {
  const tag = process.argv[2];
  if (!tag) throw new Error("No tag specified");
  const version = tag.slice(1);

  const currentVersion = getPackageJSON().version;
  if (currentVersion !== version) {
    throw new Error(
      `Package version from tag "${version}" mismatches with current version "${currentVersion}"`,
    );
  }

  const activeVersion = execSync("npm info @vitejs/plugin-react-swc version", {
    stdio: "pipe",
  })
    .toString()
    .trim();

  console.log(colors.cyan("Publishing package..."));
  const releaseTag = version.includes("beta")
    ? "beta"
    : version.includes("alpha")
    ? "alpha"
    : semverLT(currentVersion, activeVersion)
    ? "previous"
    : undefined;
  let cmd = "npm publish --access public";
  if (releaseTag) cmd += ` --tag ${releaseTag}`;
  run(cmd, { cwd: "dist" });
});
