# PostgreSQL

## Naming
- Tables / columns: `snake_case` (e.g. `employee`, `created_at`)
- Primary keys: `id` or `<entity>_id` consistently per project
- Foreign keys: `<referenced_table>_id`
- Indexes: `idx_<table>_<columns>`

## Schema & migrations
- All schema changes via Flyway or Liquibase — never rely on `ddl-auto=update` outside local throwaway DBs.
- Migrations are append-only and reviewed in PRs.
- Prefer explicit `NOT NULL`, FKs, and unique constraints over app-only checks.

## Indexes & queries
- Index columns used in `WHERE`, `JOIN`, and common `ORDER BY`.
- Avoid `SELECT *` in hot paths — project needed columns / DTO projections.
- Watch N+1 from JPA; verify with SQL logging or p6spy in review when lists grow.

## Connections (HikariCP)
- Set pool size from real concurrency (do not leave huge defaults “just in case”).
- Configure timeouts (`connectionTimeout`, `idleTimeout`, `maxLifetime`) for the environment.
- Externalize JDBC URL, user, password — never commit secrets.

## Safety
- Use parameterized queries / JPA — no string-concatenated SQL with user input.
- Least-privilege DB users per environment.
