#!/usr/bin/env node
/**
 * Install spring-mosaic MCP + host instructions into a Java / Spring workspace.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { platform } from "node:os";

const SERVER_NAME = "spring-mosaic";
const NPM_PACKAGE = "@himakarinv-stack/spring-mosaic";
const GH_PACKAGES_REGISTRY = "https://npm.pkg.github.com";

function resolvePackageRoot() {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, "..");
  if (existsSync(join(root, "standards"))) return root;
  throw new Error("Could not locate spring-mosaic package root.");
}

function parseArgs(argv) {
  const args = {
    target: process.cwd(),
    host: "all",
    mode: "auto",
    nodeCommand: "node",
    npxCommand: "npx",
    skipInstructions: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--target" && argv[i + 1]) args.target = resolve(argv[++i]);
    else if (arg === "--host" && argv[i + 1]) args.host = argv[++i];
    else if (arg === "--local") args.mode = "local";
    else if (arg === "--npx") args.mode = "npx";
    else if (arg === "--skip-instructions") args.skipInstructions = true;
    else if (arg === "--node" && argv[i + 1]) args.nodeCommand = argv[++i];
    else if (arg === "--npx-cmd" && argv[i + 1]) args.npxCommand = argv[++i];
    else if (arg === "--help") {
      console.log(`
spring-mosaic-setup — install MCP for Cursor, GitHub Copilot, Claude Code

Options:
  --target                 Project root (default: cwd)
  --host                   cursor | copilot | claude-code | claude-desktop | all
  --local                  Force local package dist/ (dev of spring-mosaic repo)
  --npx                    Force npx + GitHub Packages
  --skip-instructions      Do not overwrite AGENTS.md / CLAUDE.md / copilot files
  --node                   Node executable
  --npx-cmd                npx executable
`);
      process.exit(0);
    }
  }

  return args;
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
  console.log("Wrote", path);
}

function mergeJson(path, mergeFn) {
  const existing = existsSync(path) ? JSON.parse(readFileSync(path, "utf-8")) : {};
  writeJson(path, mergeFn(existing));
}

function toPosix(path) {
  return path.replace(/\\/g, "/");
}

function npxServerEntry(npxCommand) {
  return {
    command: npxCommand,
    args: ["-y", "--registry", GH_PACKAGES_REGISTRY, NPM_PACKAGE],
  };
}

function localServerEntry(packageRoot, nodeCommand) {
  const entry = toPosix(join(packageRoot, "dist/index.js"));
  const standards = toPosix(join(packageRoot, "standards"));
  return {
    command: nodeCommand,
    args: [entry],
    env: { SPRING_MOSAIC_ROOT: standards },
  };
}

function installedServerEntry(target, nodeCommand) {
  const pkgRoot = join(target, "node_modules", "@himakarinv-stack", "spring-mosaic");
  const entry = join(pkgRoot, "dist/index.js");
  if (!existsSync(entry)) return null;

  return {
    command: nodeCommand,
    args: ["./node_modules/@himakarinv-stack/spring-mosaic/dist/index.js"],
    env: { SPRING_MOSAIC_ROOT: "./node_modules/@himakarinv-stack/spring-mosaic/standards" },
  };
}

function resolveServerConfig(mode, packageRoot, target, nodeCommand, npxCommand) {
  if (mode === "local") {
    const entry = join(packageRoot, "dist/index.js");
    if (!existsSync(entry)) {
      console.error("Local MCP not built. Run: npm install && npm run build");
      process.exit(1);
    }
    return { mode: "local", server: localServerEntry(packageRoot, nodeCommand) };
  }

  if (mode === "npx") {
    return { mode: "npx", server: npxServerEntry(npxCommand) };
  }

  const installed = installedServerEntry(target, nodeCommand);
  if (installed) {
    return { mode: "installed", server: installed };
  }

  return { mode: "npx", server: npxServerEntry(npxCommand) };
}

function setupCursor(target, server) {
  mergeJson(join(target, ".cursor/mcp.json"), (existing) => ({
    mcpServers: { ...(existing.mcpServers ?? {}), [SERVER_NAME]: server },
  }));
}

function setupVsCodeCopilot(target, server) {
  mergeJson(join(target, ".vscode/mcp.json"), (existing) => ({
    servers: {
      ...(existing.servers ?? {}),
      [SERVER_NAME]: { type: "stdio", ...server },
    },
  }));
}

function setupClaudeCode(target, server) {
  mergeJson(join(target, ".mcp.json"), (existing) => ({
    mcpServers: {
      ...(existing.mcpServers ?? {}),
      [SERVER_NAME]: { type: "stdio", ...server },
    },
  }));
}

function setupClaudeDesktop(server, nodeCommand, npxCommand, mode, packageRoot, target) {
  const configPaths = {
    win32: join(process.env.APPDATA ?? "", "Claude", "claude_desktop_config.json"),
    darwin: join(process.env.HOME ?? "", "Library/Application Support/Claude/claude_desktop_config.json"),
    linux: join(process.env.HOME ?? "", ".config/Claude/claude_desktop_config.json"),
  };
  const configPath = configPaths[platform()] ?? configPaths.linux;

  const resolved =
    mode === "local"
      ? localServerEntry(packageRoot, nodeCommand)
      : mode === "installed"
        ? installedServerEntry(target, nodeCommand) ?? npxServerEntry(npxCommand)
        : npxServerEntry(npxCommand);

  mergeJson(configPath, (existing) => ({
    ...existing,
    mcpServers: { ...(existing.mcpServers ?? {}), [SERVER_NAME]: resolved },
  }));
  console.log("Restart Claude Desktop after editing:", configPath);
}

function installInstructions(target, packageRoot) {
  const templatesDir = join(packageRoot, "templates");
  if (!existsSync(templatesDir)) return;

  for (const file of ["AGENTS.md", "CLAUDE.md", "copilot-instructions.md"]) {
    const dest = join(target, file);
    if (existsSync(dest)) continue;
    const src = join(templatesDir, file);
    if (existsSync(src)) {
      cpSync(src, dest);
      console.log("Wrote", dest);
    }
  }

  const githubDir = join(target, ".github", "instructions");
  mkdirSync(githubDir, { recursive: true });
  const srcInstr = join(templatesDir, "spring.instructions.md");
  const destInstr = join(githubDir, "spring.instructions.md");
  if (existsSync(srcInstr) && !existsSync(destInstr)) {
    cpSync(srcInstr, destInstr);
    console.log("Wrote", destInstr);
  }
}

function expandHosts(host) {
  const map = {
    all: ["cursor", "copilot", "claude-code"],
    copilot: ["copilot"],
    vscode: ["copilot"],
    cursor: ["cursor"],
    "claude-code": ["claude-code"],
    "claude-desktop": ["claude-desktop"],
  };
  return map[host] ?? [host];
}

const PACKAGE_ROOT = resolvePackageRoot();
const args = parseArgs(process.argv);
const { target, host, mode, nodeCommand, npxCommand, skipInstructions } = args;
const { mode: resolvedMode, server } = resolveServerConfig(
  mode,
  PACKAGE_ROOT,
  target,
  nodeCommand,
  npxCommand
);
const hosts = expandHosts(host);

for (const h of hosts) {
  switch (h) {
    case "cursor":
      setupCursor(target, server);
      break;
    case "copilot":
      setupVsCodeCopilot(target, server);
      if (!skipInstructions) installInstructions(target, PACKAGE_ROOT);
      break;
    case "claude-code":
      setupClaudeCode(target, server);
      if (!skipInstructions) installInstructions(target, PACKAGE_ROOT);
      break;
    case "claude-desktop":
      setupClaudeDesktop(server, nodeCommand, npxCommand, resolvedMode, PACKAGE_ROOT, target);
      break;
    default:
      console.error("Unknown host:", h);
      process.exit(1);
  }
}

console.log(`
Done (${resolvedMode} mode).

MCP: spring-mosaic

Workflows:
  • PR review     — review_pr_diff, scan_violations, review_architecture
  • Standards     — list_quality_domains, get_quality_guide, explain_pattern
  • Context       — detect_spring_context
`);
