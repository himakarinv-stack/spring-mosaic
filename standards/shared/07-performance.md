# Performance

## Data access
- Watch for N+1 selects; use join fetch / entity graphs / batch size.
- Paginate large collections; never return unbounded lists from APIs.
- Index columns used in filters and joins (coordinate with DBAs).

## Runtime
- Size connection pools for real load; do not leave defaults blindly in prod.
- Cache carefully (Spring Cache) with clear TTLs and invalidation.
- Prefer async / messaging for long-running work; keep request threads short.

## Observability
- Expose health and metrics (Actuator) with auth appropriately.
- Correlate logs with request IDs where possible.
