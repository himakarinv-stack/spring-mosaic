# PR review format

## Output structure
1. **Summary** (1–3 sentences)
2. **Blockers** — must fix before merge
3. **Majors** — should fix in this PR
4. **Minors / nits** — optional follow-ups
5. **Questions** — clarifications for the author

## Severity
- **blocker**: security, data loss, broken API contract, layer violations that ship risk
- **major**: maintainability / correctness issues likely to cause bugs
- **minor**: style, naming, small cleanups
- **info**: suggestions, alternatives, praise

## Rules of engagement
- Cite file paths and concrete guidance.
- Prefer one finding per issue; avoid repeating the same rule.
- Match spring-mosaic standards; do not invent conflicting house rules mid-review.
