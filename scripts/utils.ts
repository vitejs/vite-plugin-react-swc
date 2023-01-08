import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import {
  execSync,
  ExecSyncOptionsWithBufferEncoding,
} from "node:child_process";
import { readFileSync } from "node:fs";
import * as colors from "picocolors";

export const main = (fn: () => Promise<void>) => {
  fn().catch((err) => {
    console.error(err);
    process.exit(1);
  });
};

export const ask = (question: string) =>
  new Promise<string>((res) =>
    createInterface({ input: stdin, output: stdout }).question(question, res),
  );

export const run = (cmd: string, opts?: ExecSyncOptionsWithBufferEncoding) => {
  console.log(colors.dim(`$ ${cmd}`));
  execSync(cmd, { stdio: "inherit", ...opts });
};

export const getPackageJSON = () =>
  JSON.parse(readFileSync("package.json", "utf-8")) as { version: string };
