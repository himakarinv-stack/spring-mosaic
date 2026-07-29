# spring-mosaic

MCP server that **reviews SoftTech Java / Spring Boot / PostgreSQL repositories**, scores changes against org standards, and returns **actionable feedback** so teams follow best practices.

Sibling of [`ai-mosaic`](https://github.com/himakarinv-stack/ai-mosaic) (Angular / TS frontends).

Package: [`@himakarinv-stack/spring-mosaic`](https://github.com/himakarinv-stack/spring-mosaic/pkgs/npm/spring-mosaic) · GitHub Packages

## What it does for SoftTech repos

| Step | Tool |
|------|------|
| Detect stack | `detect_spring_context` |
| Plan the review | `review_pr_diff` |
| Scan changes | `audit_changed_files` / `audit_workspace` |
| Standards | `get_pr_review_brief`, `get_review_sections_for_diff`, `get_quality_guide` |
| Architecture | `review_architecture` |

Agents should install this MCP in backend repos (HRMS, APIs, etc.) and run the workflow on every PR / local change set.

## Install into a Spring / Java repo

### 1. Authenticate (one-time)

```
@himakarinv-stack:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### 2. Install + wire Cursor

```bash
npm install --save-dev @himakarinv-stack/spring-mosaic
npx spring-mosaic-setup
```

Or:

```bash
npx --registry=https://npm.pkg.github.com -p @himakarinv-stack/spring-mosaic spring-mosaic-setup
```

## Suggested review workflow

```
detect_spring_context
  → review_pr_diff (changed files)
  → audit_changed_files
  → get_pr_review_brief + get_review_sections_for_diff
  → write human feedback (blockers → info) using review-format
```

## Tools

| Tool | Purpose |
|------|---------|
| `detect_spring_context` | Boot/Java version, Maven/Gradle, modules |
| `list_quality_domains` | Domain index |
| `get_quality_guide` | One standards section |
| `explain_pattern` | Topic deep-dive |
| `get_pr_review_brief` | Review format + anti-patterns |
| `get_review_sections_for_diff` | Sections for changed extensions |
| `review_pr_diff` | PR orchestration plan |
| `audit_changed_files` | Structured feedback on a change set |
| `audit_workspace` | Scan a path under the repo |
| `review_architecture` | Layer checklist |
| `scan_violations` | Single-file heuristic scan |

## Local develop

```bash
cd "d:/softtech/MCP servers/spring-mosaic"
npm install
npm run build
npx spring-mosaic-setup --local --target path/to/java-repo
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [PUBLISH.md](./PUBLISH.md).
