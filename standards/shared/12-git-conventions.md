# Git conventions (org standard)

Branch and commit naming for Java / Spring workspaces using spring-mosaic.
Aligned with **ai-mosaic** so SoftTech repos share one convention.

## Branch format

`<type>/<short-kebab-description>`

Types: `feat` | `fix` | `chore` | `docs` | `refactor` | `test` | `ci` | `release` | `perf` | `build` | `style`

Examples: `feat/employee-search`, `fix/null-pointer-order-service`

Optional ticket: `feat/spm-45-null-pointer-order-service` (ticket as kebab segment is fine).

## Commit format

`<type>(optional-scope): <imperative summary>`

- No trailing period
- Subject ≤ 72 characters
- Imperative mood (“add”, not “added”)

Examples: `feat(api): add employee search filter`, `fix(jpa): prevent N+1 on order lines`

## PR title

Same style as a Conventional Commit subject.

## Enforcement

Prefer husky + commitlint + CI conventions check in each consumer repo (see CONTRIBUTING in spring-mosaic / ai-mosaic).
