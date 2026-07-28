#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const entry = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "index.js");
const child = spawn(process.execPath, [entry], { stdio: "inherit", env: process.env });
child.on("exit", (code) => process.exit(code ?? 1));
