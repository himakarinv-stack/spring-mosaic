# REST API

## Controllers
- Thin: validate input, call service, map to response.
- Use `@RestController` + explicit `@RequestMapping` / verb mappings.
- Prefer constructor injection; no field `@Autowired`.

## DTOs & validation
- Request/response DTOs separate from entities.
- Bean Validation (`@Valid`, `@NotNull`, `@Size`, …) on request bodies and params.
- Consistent error body via `@ControllerAdvice` / `ProblemDetail` (Boot 3).

## API design
- Resource-oriented paths: `/api/v1/employees/{id}`.
- Proper status codes (201 create, 204 no content, 404 missing, 409 conflict).
- Pagination for list endpoints (`Pageable` or explicit cursor).
- Idempotent PUT/DELETE where applicable.

## Errors
- Centralize exception handling with `@ControllerAdvice` / `@RestControllerAdvice`.
- Prefer Boot 3 `ProblemDetail` (or a single consistent error DTO) — no ad-hoc `Map` error bodies per controller.
- Map domain failures to correct HTTP status; never return 200 with an error payload.

## OpenAPI
- Document public APIs (springdoc or equivalent).
- Keep examples and error responses accurate when contracts change.
