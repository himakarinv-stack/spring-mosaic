# Spring Boot 2 profile

## Baseline
- Typically Java 8–11 (confirm project).
- `javax.*` packages.
- Legacy security config may still use adapter patterns — prefer migrating toward component-based security when touching auth.

## Configuration
- Keep property names consistent; document profile overrides.
- Plan Boot 3 migration before adding large new `javax`-only dependencies.

## Guidance
- New code should still use constructor injection and layered architecture.
- Avoid investing heavily in Boot-2-only APIs if upgrade is near-term.
