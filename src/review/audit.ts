import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { scanSource, formatViolations, type Violation } from "./scanner.js";
import { reviewArchitectureNotes } from "./scanner.js";

export interface FileFinding {
  filePath: string;
  violations: Violation[];
}

export interface AuditReport {
  workspaceRoot: string;
  changedFiles: string[];
  findings: FileFinding[];
  architectureNotes: string;
  summary: {
    blockers: number;
    majors: number;
    minors: number;
    infos: number;
    filesScanned: number;
  };
}

function collectJavaFiles(root: string, subPath: string, maxFiles = 200): string[] {
  const results: string[] = [];
  const start = join(root, subPath);

  function walk(dir: string): void {
    if (results.length >= maxFiles) return;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (results.length >= maxFiles) return;
      if (entry === "target" || entry === "build" || entry === ".git" || entry === "node_modules") {
        continue;
      }
      const full = join(dir, entry);
      let st: ReturnType<typeof statSync>;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(full);
      else if (/\.(java|kt)$/i.test(entry)) results.push(full);
    }
  }

  if (!existsSync(start)) return results;
  const st = statSync(start);
  if (st.isFile()) {
    if (/\.(java|kt)$/i.test(start)) results.push(start);
  } else walk(start);
  return results;
}

function toPosixRel(root: string, full: string): string {
  return full.slice(root.length).replace(/^[/\\]/, "").replace(/\\/g, "/");
}

export function auditChangedFiles(
  workspaceRoot: string,
  changedFiles: string[],
  fileContents?: Record<string, string>
): AuditReport {
  const findings: FileFinding[] = [];
  let blockers = 0;
  let majors = 0;
  let minors = 0;
  let infos = 0;

  for (const rel of changedFiles) {
    const normalized = rel.replace(/\\/g, "/");
    if (!/\.(java|kt)$/i.test(normalized)) continue;

    let source = fileContents?.[rel] ?? fileContents?.[normalized];
    if (source == null) {
      const full = join(workspaceRoot, rel);
      if (!existsSync(full)) continue;
      try {
        source = readFileSync(full, "utf-8");
      } catch {
        continue;
      }
    }

    const violations = scanSource(source, normalized);
    for (const v of violations) {
      if (v.severity === "blocker") blockers++;
      else if (v.severity === "major") majors++;
      else if (v.severity === "minor") minors++;
      else infos++;
    }
    findings.push({ filePath: normalized, violations });
  }

  return {
    workspaceRoot,
    changedFiles,
    findings,
    architectureNotes: reviewArchitectureNotes(changedFiles),
    summary: {
      blockers,
      majors,
      minors,
      infos,
      filesScanned: findings.length,
    },
  };
}

export function auditWorkspacePath(
  workspaceRoot: string,
  scanPath = "src",
  maxFiles = 200
): AuditReport {
  const files = collectJavaFiles(workspaceRoot, scanPath, maxFiles);
  const changedFiles = files.map((f) => toPosixRel(workspaceRoot, f));
  return auditChangedFiles(workspaceRoot, changedFiles);
}

export function formatAuditReport(report: AuditReport): string {
  const lines: string[] = [
    `# spring-mosaic audit feedback`,
    ``,
    `Workspace: \`${report.workspaceRoot}\``,
    `Files scanned: **${report.summary.filesScanned}**`,
    `Blockers: **${report.summary.blockers}** · Majors: **${report.summary.majors}** · Minors: **${report.summary.minors}** · Info: **${report.summary.infos}**`,
    ``,
    `## How to use this feedback`,
    `1. Fix **blockers** before merge.`,
    `2. Address **majors** in this PR when feasible.`,
    `3. Track **minors/info** as follow-ups if needed.`,
    `4. Align with spring-mosaic domains: architecture, rest-api, data-jpa, postgresql, security, testing.`,
    ``,
    report.architectureNotes,
    ``,
    `## Findings by file`,
  ];

  if (!report.findings.length) {
    lines.push(``, `_No Java/Kotlin files scanned or no heuristic hits._`);
  }

  for (const f of report.findings) {
    lines.push(``, `### \`${f.filePath}\``);
    if (!f.violations.length) {
      lines.push(`- No heuristic violations.`);
    } else {
      lines.push(formatViolations(f.violations));
    }
  }

  lines.push(
    ``,
    `## Suggested agent next steps`,
    `- Call \`get_pr_review_brief\` then write a human review using review-format severities.`,
    `- Call \`get_review_sections_for_diff\` for the changed extensions.`,
    `- Call \`get_quality_guide\` for postgresql / rest-api / data-jpa when DB or API files changed.`
  );

  return lines.join("\n");
}
