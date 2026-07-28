# Security

## Basics
- No secrets in source, logs, or commit history — use env / vault / Spring config.
- Validate and sanitize all external input (params, headers, files).
- Principle of least privilege for DB and service accounts.

## Spring Security
- Explicit security filter chain; deny-by-default for sensitive routes.
- Prefer method security (`@PreAuthorize`) for fine-grained rules when needed.
- Do not disable CSRF casually on cookie-based browser apps; for pure JWT APIs document the tradeoff.

## Data protection
- Hash passwords with a modern encoder (BCrypt/Argon2) — never store plaintext.
- Avoid logging PII; mask tokens and credentials.
- Use HTTPS in all non-local environments.
