# Anti-patterns (reject list)

| Pattern | Why reject |
|---------|------------|
| Field `@Autowired` | Harder to test; hidden deps — use constructors |
| Business logic in controllers | Untestable / mixed concerns |
| Entities as API bodies | Lazy-load / serialization leaks |
| `@Transactional` on controllers | Wrong boundary; long-lived TX |
| Empty catch / `printStackTrace` | Silent or noisy failures |
| Hardcoded passwords / keys | Security incident waiting |
| `ddl-auto=update` in shared envs | Untracked schema drift |
| God services / util dumps | Unmaintainable coupling |
| Catching broad `Exception` and ignoring | Hides bugs |
| Blocking remote calls inside DB TX | Scalability / lock issues |
| Entities as OpenAPI models | Couples persistence to public contract |
| Missing `@ControllerAdvice` with scattered try/catch | Inconsistent API errors |
| Unindexed FK / filter columns under load | Slow queries / table scans |
| Hardcoded JDBC URLs / pool secrets | Security + env fragility |
