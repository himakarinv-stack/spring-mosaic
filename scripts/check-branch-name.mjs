#!/usr/bin/env node
const ALLOWED =
  /^(feat|fix|chore|docs|refactor|test|ci|release|perf|build|style)\/[a-z0-9]+(?:[.-][a-z0-9]+)*$/;

const branch = (process.argv[2] ?? "").trim();

if (!branch) {
  console.error("Usage: node scripts/check-branch-name.mjs <branch-name>");
  process.exit(1);
}

if (branch === "main" || branch === "master") {
  console.error(
    `Branch "${branch}" is protected. Use type/kebab-description. See CONTRIBUTING.md.`
  );
  process.exit(1);
}

if (!ALLOWED.test(branch)) {
  console.error(
    [
      `Invalid branch name: "${branch}"`,
      "Expected: <type>/<short-kebab-description>",
      "Types: feat | fix | chore | docs | refactor | test | ci | release | perf | build | style",
      "Example: feat/audit-changed-files",
      "See CONTRIBUTING.md.",
    ].join("\n")
  );
  process.exit(1);
}

console.log(`Branch name OK: ${branch}`);
