# Agent instructions — SoftTech Spring / Java

Use **spring-mosaic** to review this repository’s changes and enforce SoftTech backend best practices.

## On every PR / meaningful change set
1. `detect_spring_context`
2. `review_pr_diff` with the changed file list
3. `audit_changed_files` (same list) — fix or report blockers/majors
4. `get_pr_review_brief` + `review_architecture`
5. Write feedback for the author using review-format severities

## Domains
architecture · java-language · spring-boot · rest-api · data-jpa · postgresql · security · testing · performance · git-conventions

## Pair with ai-mosaic
If this monorepo also has Angular UI, use **ai-mosaic** for frontend and **spring-mosaic** for backend.
