# Contributing to spring-mosaic

This package is SoftTech’s **Java / Spring Boot MCP reviewer**. It must dogfood the same git conventions it teaches consumer repos.

## Mission

When installed in (or pointed at) SoftTech backend repositories, spring-mosaic:

1. Detects Spring Boot / Java context
2. Reviews changed files against published standards
3. Returns structured feedback (blockers → info) so authors follow best practices

## Branches

```
<type>/<short-kebab-description>
```

Types: `feat` | `fix` | `chore` | `docs` | `refactor` | `test` | `ci` | `release` | `perf` | `build` | `style`

Optional ticket segment: `feat/spm-45-null-pointer-order-service`

Do not commit directly to `main`.

## Commits

```
<type>(optional-scope): <imperative summary>
```

Examples: `feat(audit): add audit_changed_files tool`, `docs: clarify consumer review workflow`

## Enforcement

From repo root:

```bash
npm install
```

| Hook | Blocks when |
|------|-------------|
| `commit-msg` | Subject is not Conventional Commits |
| `pre-push` | Branch name invalid or is `main` |

CI workflow **Conventions** validates branch, PR title, and commits on PRs.

## Release

Tag `vX.Y.Z` and publish a GitHub Release — see [PUBLISH.md](./PUBLISH.md).
