# Spring Boot 3 profile

## Baseline
- Java 17+ (prefer current LTS used by the team).
- Jakarta EE namespace (`jakarta.*`).
- Prefer `ProblemDetail` for API errors.
- Use `SecurityFilterChain` bean (no `WebSecurityConfigurerAdapter`).

## Configuration
- `application.yml` / profile-specific files (`application-dev.yml`).
- Type-safe `@ConfigurationProperties` over scattered `@Value` for groups of settings.
- Fail fast on missing required config in prod.

## Starters
- Add only needed starters; prefer Boot BOM management.
- Actuator endpoints locked down in non-local profiles.
