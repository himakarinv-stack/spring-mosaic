# spring-mosaic

MCP server for **Java / Spring Boot** architecture, API quality, and PR review — the sibling of [`ai-mosaic`](../ai-mosaic) (Angular).

Same protocol and Cursor wiring as `ai-mosaic`; different domain (JVM / Spring).

## Naming

| Name | Notes |
|------|--------|
| **spring-mosaic** (chosen) | Pairs with `ai-mosaic`; clear Spring focus |
| `java-mosaic` | Broader JVM (Java/Kotlin) without Boot emphasis |
| `boot-mosaic` | Boot-only branding |
| `mosaic-jvm` | Family name for all JVM backends |

Published on **GitHub Packages** (same pattern as `@himakarinv-stack/ai-mosaic`).

Package: [`@himakarinv-stack/spring-mosaic`](https://github.com/himakarinv-stack/spring-mosaic/pkgs/npm/spring-mosaic)

## Install into a Spring / Java repo

### 1. Authenticate (one-time per machine)

```
@himakarinv-stack:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### 2. Install and set up

```bash
npx --registry=https://npm.pkg.github.com @himakarinv-stack/spring-mosaic spring-mosaic-setup
```

Or as a dev dependency:

```bash
npm install --save-dev @himakarinv-stack/spring-mosaic
npx spring-mosaic-setup
```

Flags: `--skip-instructions`, `--host cursor|copilot|all`, `--local`, `--npx`

## Local develop

```bash
cd "d:/softtech/MCP servers/spring-mosaic"
npm install
npm run build
npx spring-mosaic-setup --local --target path/to/java-repo
```

See [PUBLISH.md](./PUBLISH.md) for release / publish steps.

## Tools

| Tool | Purpose |
|------|---------|
| `detect_spring_context` | Boot/Java version, Maven/Gradle, modules |
| `list_quality_domains` | Domain index |
| `get_quality_guide` | One standards section (`spring-boot` is boot2/boot3 aware) |
| `explain_pattern` | Topic deep-dive |
| `get_pr_review_brief` | Review format + anti-patterns |
| `get_review_sections_for_diff` | Sections for changed extensions |
| `review_pr_diff` | PR orchestration plan |
| `review_architecture` | Layer checklist |
| `scan_violations` | Heuristic Java/Spring anti-pattern scan |

## Suggested PR workflow

```
detect_spring_context → get_pr_review_brief → review_pr_diff
  → scan_violations (per file) → review_architecture
```

## Note on implementation language

This package is a **Node MCP server** (like `ai-mosaic`) that teaches and reviews **Java/Spring** code. A native Spring Boot MCP (Spring AI starters) is optional later if you want HTTP-deployed tools; Cursor STDIO works best with this layout today.
