# Testing

## Pyramid
- Fast unit tests for domain and services (Mockito where needed).
- Slice tests (`@WebMvcTest`, `@DataJpaTest`) for boundaries.
- Few integration tests (`@SpringBootTest` + Testcontainers) for critical paths.

## Practices
- Name tests by behavior, not methods (`createsEmployee_whenValidRequest`).
- Deterministic data; no reliance on execution order.
- Prefer AssertJ for readable assertions.
- Cover failure paths (validation, 404, auth denial), not only happy path.

## Avoid
- Testing only through the full context for every class.
- Brittle tests coupled to private implementation details.
- Ignoring flaky Testcontainers / timing issues — fix root cause.
