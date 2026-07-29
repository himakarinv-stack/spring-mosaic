# Performance

## Data access
- Watch for N+1 selects; use join fetch / entity graphs / batch size.
- Paginate large collections; never return unbounded lists from APIs.
- Index columns used in filters and joins (coordinate with DBAs).

## Runtime
- Size HikariCP (or chosen pool) for real load; set timeouts explicitly per environment.
- Externalize pool settings in `application-*.yml` — review when concurrency changes.
- Cache carefully (Spring Cache) with clear TTLs and invalidation.
- Prefer async / messaging for long-running work; keep request threads short.

## Observability
- Expose health and metrics (Actuator) with auth appropriately.
- Correlate logs with request IDs where possible.
