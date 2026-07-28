# Architecture (Java / Spring)

## Goals
- Clear boundaries between **API**, **application**, **domain**, and **infrastructure**.
- Dependencies point inward: controllers → services → domain; infrastructure implements ports.
- One feature change should not require editing unrelated layers.

## Preferred layouts (pick one per repo and stay consistent)

### Layered packages
```
com.company.app
  ├── api          # controllers, DTOs, mappers
  ├── application  # services, use-cases
  ├── domain       # entities, value objects, domain services
  └── infrastructure # JPA, messaging, external clients
```

### Feature packages
```
com.company.app
  ├── employee
  │     ├── api
  │     ├── application
  │     └── domain
  └── shared
```

## Rules
- Controllers do not call repositories or `EntityManager` directly.
- Services own business rules and `@Transactional` boundaries.
- Do not expose JPA entities as REST response/request bodies — use DTOs.
- Shared kernels stay small; avoid a dumping-ground `util` package for domain logic.
- Cross-cutting concerns (security, logging, metrics) via Spring mechanisms, not copy-paste.
