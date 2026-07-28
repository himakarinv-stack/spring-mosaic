# Scaffolding

## New feature / module
1. Choose layered vs feature-package layout (match the repo).
2. Add: controller (if API), request/response DTOs, service, repository (if persistence), tests.
3. Wire security rules if the endpoint is authenticated.
4. Add Flyway/Liquibase migration when schema changes.
5. Update OpenAPI / README only when public contract changes.

## Naming
- `*Controller`, `*Service`, `*Repository`, `*Request`, `*Response`, `*Entity` (or domain name without suffix in rich models).
- Packages lowercase; no camelCase package segments.
