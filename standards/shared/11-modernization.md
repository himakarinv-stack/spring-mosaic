# Modernization

## Spring Boot 2 → 3
- `javax.*` → `jakarta.*`
- Security filter chain DSL migration
- Removals of deprecated actuators / properties
- Confirm Java baseline (17+ typical for Boot 3)

## Dependency hygiene
- Align BOM versions; avoid duplicate conflicting starters.
- Replace abandoned libraries with maintained alternatives.
- Enable and fix compiler / SpotBugs / Checkstyle findings gradually.

## Process
- Migrate in thin PRs (compile → tests → behavior).
- Keep a short checklist in the PR description.
