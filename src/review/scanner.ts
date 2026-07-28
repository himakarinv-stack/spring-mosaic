export interface Violation {
  severity: "blocker" | "major" | "minor" | "info";
  rule: string;
  message: string;
  hint?: string;
}

export function scanSource(source: string, filePath: string): Violation[] {
  const violations: Violation[] = [];
  const lowerPath = filePath.replace(/\\/g, "/").toLowerCase();
  const isJava = lowerPath.endsWith(".java") || lowerPath.endsWith(".kt");
  if (!isJava) return violations;

  const lines = source.split(/\r?\n/);

  const add = (v: Violation) => violations.push(v);

  if (/@RestController[\s\S]*?@Autowired\s+(?!private\s+final)/.test(source) ||
      (/@RestController/.test(source) && /@Autowired\s+(public\s+)?(?!.*final)/.test(source) && !/constructor/i.test(source))) {
    // field injection heuristic
  }

  if (/@Autowired\s+(private|protected|public)?\s*(?!final)/.test(source) && !/requiredArgsConstructor|AllArgsConstructor/i.test(source)) {
    if (/@Autowired\s*\n?\s*(private|protected)\s+(?!final)/.test(source) || /@Autowired\s+(private|protected)\s+\w+/.test(source)) {
      add({
        severity: "major",
        rule: "prefer-constructor-injection",
        message: "Field @Autowired detected — prefer constructor injection.",
        hint: "Use a final field + constructor (or @RequiredArgsConstructor).",
      });
    }
  }

  if (/System\.out\.print/.test(source)) {
    add({
      severity: "minor",
      rule: "no-system-out",
      message: "System.out used — use a logger (SLF4J).",
    });
  }

  if (/catch\s*\([^)]+\)\s*\{\s*\}/.test(source) || /catch\s*\([^)]+\)\s*\{\s*\/\/.*\n\s*\}/.test(source)) {
    add({
      severity: "major",
      rule: "empty-catch",
      message: "Empty catch block — swallows failures silently.",
    });
  }

  if (/e\.printStackTrace\s*\(/.test(source)) {
    add({
      severity: "minor",
      rule: "no-print-stack-trace",
      message: "printStackTrace — log with context instead.",
    });
  }

  if (/password\s*=\s*["'][^"']+["']/i.test(source) || /api[_-]?key\s*=\s*["'][^"']+["']/i.test(source)) {
    add({
      severity: "blocker",
      rule: "no-hardcoded-secrets",
      message: "Possible hardcoded secret in source.",
      hint: "Move to env / secret manager / Spring config.",
    });
  }

  if (/@Entity/.test(source) && /@Data\b/.test(source)) {
    add({
      severity: "major",
      rule: "entity-no-lombok-data",
      message: "@Entity with @Data can break equals/hashCode and lazy loading.",
      hint: "Prefer explicit equals/hashCode on business key, or @Getter/@Setter carefully.",
    });
  }

  if (/@RestController/.test(source) && /@Repository/.test(source)) {
    add({
      severity: "blocker",
      rule: "layer-bleed",
      message: "Controller also marked @Repository — layers mixed.",
    });
  }

  if (/@RestController/.test(source) && /EntityManager|JdbcTemplate|JpaRepository/.test(source)) {
    add({
      severity: "major",
      rule: "controller-persistence",
      message: "Controller appears to touch persistence APIs directly.",
      hint: "Move data access behind a service / repository layer.",
    });
  }

  if (/select \* from/i.test(source)) {
    add({
      severity: "minor",
      rule: "no-select-star",
      message: "SELECT * in query — prefer explicit columns / projections.",
    });
  }

  if (/@Transactional/.test(source) && /@RestController/.test(source)) {
    add({
      severity: "major",
      rule: "transaction-on-controller",
      message: "@Transactional on controller — keep transactions in the service layer.",
    });
  }

  if (/throws\s+Exception\b/.test(source) && /public\s+/.test(source)) {
    add({
      severity: "info",
      rule: "broad-throws-exception",
      message: "Broad `throws Exception` on public API — prefer specific exceptions.",
    });
  }

  // unused lines var kept for future line-level reporting
  void lines;

  return violations;
}

export function formatViolations(violations: Violation[]): string {
  if (!violations.length) {
    return "No heuristic violations found.";
  }
  return violations
    .map(
      (v) =>
        `- **[${v.severity}]** \`${v.rule}\`: ${v.message}${v.hint ? `\n  _Hint:_ ${v.hint}` : ""}`
    )
    .join("\n");
}

export function reviewPrDiff(changedFiles: string[], extensions: string[]): string {
  return [
    `# PR review plan (spring-mosaic)`,
    ``,
    `## Changed files (${changedFiles.length})`,
    ...changedFiles.map((f) => `- ${f}`),
    ``,
    `## Extensions`,
    extensions.map((e) => `\`${e || "(none)"}\``).join(", ") || "(none)",
    ``,
    `## Suggested steps`,
    `1. Call \`get_pr_review_brief\` then \`get_review_sections_for_diff\` with the extensions above.`,
    `2. For each \`.java\` / \`.kt\` file, call \`scan_violations\` with path + source.`,
    `3. Call \`review_architecture\` for package / layer boundary checks.`,
    `4. Write findings using \`review-format\` severities (blocker / major / minor / info).`,
  ].join("\n");
}

export function reviewArchitectureNotes(changedFiles: string[]): string {
  const controllers = changedFiles.filter((f) => /controller/i.test(f));
  const services = changedFiles.filter((f) => /service/i.test(f));
  const repos = changedFiles.filter((f) => /repository|repo/i.test(f));
  const entities = changedFiles.filter((f) => /entity|model|domain/i.test(f));

  return [
    `# Architecture checklist`,
    ``,
    `- Controllers touched: ${controllers.length ? controllers.join(", ") : "none"}`,
    `- Services touched: ${services.length ? services.join(", ") : "none"}`,
    `- Repositories touched: ${repos.length ? repos.join(", ") : "none"}`,
    `- Entities / domain touched: ${entities.length ? entities.join(", ") : "none"}`,
    ``,
    `## Verify`,
    `- Controllers depend on services (not repositories / EntityManager).`,
    `- Services own transactions and business rules.`,
    `- Entities are not exposed as API response bodies (use DTOs).`,
    `- Package boundaries stay unidirectional (api → application → domain → infra).`,
    `- New modules follow scaffolding conventions (feature package or layered package — stay consistent).`,
  ].join("\n");
}
