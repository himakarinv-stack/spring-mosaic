# Data / JPA

## Entities
- Prefer explicit equals/hashCode on a stable business key — avoid Lombok `@Data` on `@Entity`.
- Lazy associations by default; fetch joins / entity graphs when needed.
- Do not use bidirectional graphs casually in APIs.

## Repositories
- Spring Data interfaces stay thin; complex queries in custom fragments or JPQL/Criteria.
- Avoid `SELECT *` mental model — project to DTOs / interfaces when reading for APIs.

## Transactions
- `@Transactional` on application services, not controllers.
- Read-only transactions for queries (`readOnly = true`).
- Keep transaction boundaries short; no remote HTTP calls inside a transaction.

## Schema
- Prefer Flyway or Liquibase over `ddl-auto=update` in shared environments.
- Migrations are forward-only and reviewed like code.
