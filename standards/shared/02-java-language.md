# Java language

## Naming
- Classes / interfaces / enums: `PascalCase`
- Methods / fields / locals: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Packages: lowercase, no camelCase segments (`com.company.app.employee`)

## Style
- Prefer immutable data where practical (`final` fields, records for simple DTOs on Java 16+).
- Prefer composition over deep inheritance.
- Avoid public mutable fields.
- Keep methods focused; extract when a method mixes I/O, persistence, and business rules.

## Nullability & APIs
- Prefer `Optional` for return values that may be absent (not for fields or method params).
- Fail fast on invalid arguments (`Objects.requireNonNull` or Bean Validation at boundaries).
- Do not return `null` collections — return empty lists/maps.

## Exceptions
- Prefer specific checked/unchecked exceptions over broad `throws Exception`.
- Never swallow exceptions in empty `catch` blocks.
- Translate persistence / remote failures into domain or API exceptions at service boundaries.
