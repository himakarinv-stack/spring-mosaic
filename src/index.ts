#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { resolveStandardsDir } from "./paths.js";
import { detectSpringContext, formatContext } from "./context/spring-context.js";
import {
  DOMAIN_SUMMARIES,
  readGuide,
  buildReviewBrief,
  buildDiffSections,
  explainPattern,
  type QualityDomain,
} from "./standards/loader.js";
import {
  scanSource,
  formatViolations,
  reviewArchitectureNotes,
  reviewPrDiff,
} from "./review/scanner.js";
import { auditChangedFiles, auditWorkspacePath, formatAuditReport } from "./review/audit.js";

const STANDARDS_DIR = resolveStandardsDir();

const qualityDomainSchema = z.enum([
  "architecture",
  "java-language",
  "spring-boot",
  "rest-api",
  "data-jpa",
  "postgresql",
  "security",
  "testing",
  "performance",
  "anti-patterns",
  "review-format",
  "scaffolding",
  "modernization",
  "git-conventions",
] as const);

const server = new McpServer({
  name: "spring-mosaic",
  version: "0.2.0",
});

function resolveWorkspace(workspaceRoot?: string): string {
  return workspaceRoot ?? process.cwd();
}

server.tool(
  "detect_spring_context",
  "Detect Spring Boot / Java version, build tool, and modules. Call first when reviewing a repo.",
  {
    workspaceRoot: z.string().optional().describe("Project root (default: cwd)"),
  },
  async ({ workspaceRoot }) => {
    const ctx = detectSpringContext(resolveWorkspace(workspaceRoot));
    return { content: [{ type: "text" as const, text: formatContext(ctx) }] };
  }
);

server.tool(
  "list_quality_domains",
  "Index of Java/Spring quality domains used when reviewing SoftTech backend repos.",
  {},
  async () => ({
    content: [
      {
        type: "text" as const,
        text: Object.entries(DOMAIN_SUMMARIES)
          .map(([key, summary]) => `- **${key}**: ${summary}`)
          .join("\n"),
      },
    ],
  })
);

server.tool(
  "get_quality_guide",
  "Fetch ONE quality guide. spring-boot is version-scoped (boot2 vs boot3).",
  {
    domain: qualityDomainSchema,
    workspaceRoot: z.string().optional(),
  },
  async ({ domain, workspaceRoot }) => {
    const ctx = detectSpringContext(resolveWorkspace(workspaceRoot));
    const text = readGuide(STANDARDS_DIR, domain as QualityDomain, ctx.profileKey);
    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "explain_pattern",
  "Deep-dive on a Spring/Java topic (jpa, postgres, rest, security, transactions, etc.).",
  {
    topic: z.string().describe("e.g. jpa, postgres indexes, rest dto, constructor injection"),
    workspaceRoot: z.string().optional(),
  },
  async ({ topic, workspaceRoot }) => {
    const ctx = detectSpringContext(resolveWorkspace(workspaceRoot));
    const text = explainPattern(STANDARDS_DIR, ctx.profileKey, topic);
    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "get_pr_review_brief",
  "Minimal PR review brief: review format + anti-patterns. Use before writing feedback.",
  {
    workspaceRoot: z.string().optional(),
  },
  async ({ workspaceRoot }) => {
    const ctx = detectSpringContext(resolveWorkspace(workspaceRoot));
    return {
      content: [{ type: "text" as const, text: buildReviewBrief(STANDARDS_DIR, ctx.profileKey) }],
    };
  }
);

server.tool(
  "get_review_sections_for_diff",
  "Return only quality sections relevant to changed file types.",
  {
    changedExtensions: z.array(z.string()).describe("e.g. ['.java', '.yml', '.sql']"),
    workspaceRoot: z.string().optional(),
  },
  async ({ changedExtensions, workspaceRoot }) => {
    const ctx = detectSpringContext(resolveWorkspace(workspaceRoot));
    const text = buildDiffSections(STANDARDS_DIR, ctx.profileKey, changedExtensions);
    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "review_pr_diff",
  "PR review orchestration for SoftTech Java repos: plan + next MCP steps.",
  {
    changedFiles: z.array(z.string()),
    workspaceRoot: z.string().optional(),
  },
  async ({ changedFiles, workspaceRoot }) => {
    const ctx = detectSpringContext(resolveWorkspace(workspaceRoot));
    const extensions = [
      ...new Set(
        changedFiles.map((f) => {
          const base = f.split(/[/\\]/).pop() ?? f;
          const i = base.lastIndexOf(".");
          return i >= 0 ? base.slice(i) : "";
        })
      ),
    ];
    const text = [formatContext(ctx), "", "---", "", reviewPrDiff(changedFiles, extensions)].join(
      "\n"
    );
    return { content: [{ type: "text" as const, text }] };
  }
);

server.tool(
  "audit_changed_files",
  "Scan changed Java/Kotlin files and return structured best-practice feedback (blockers/majors/minors).",
  {
    changedFiles: z.array(z.string()).describe("Paths relative to workspace root"),
    workspaceRoot: z.string().optional(),
    fileContents: z
      .record(z.string())
      .optional()
      .describe("Optional map of path → source when files are not on disk"),
  },
  async ({ changedFiles, workspaceRoot, fileContents }) => {
    const root = resolveWorkspace(workspaceRoot);
    const report = auditChangedFiles(root, changedFiles, fileContents);
    return { content: [{ type: "text" as const, text: formatAuditReport(report) }] };
  }
);

server.tool(
  "audit_workspace",
  "Scan a path under a Java/Spring repo and return aggregated coding-practice feedback.",
  {
    scanPath: z.string().default("src").describe("Path relative to workspace root"),
    workspaceRoot: z.string().optional(),
    maxFiles: z.number().int().positive().max(500).optional().default(200),
  },
  async ({ scanPath, workspaceRoot, maxFiles }) => {
    const root = resolveWorkspace(workspaceRoot);
    const report = auditWorkspacePath(root, scanPath, maxFiles);
    return { content: [{ type: "text" as const, text: formatAuditReport(report) }] };
  }
);

server.tool(
  "review_architecture",
  "Architecture checklist for a Java/Spring diff — use in PR feedback.",
  {
    changedFiles: z.array(z.string()),
    workspaceRoot: z.string().optional(),
  },
  async ({ changedFiles }) => ({
    content: [{ type: "text" as const, text: reviewArchitectureNotes(changedFiles) }],
  })
);

server.tool(
  "scan_violations",
  "Heuristic scan of a single Java/Kotlin source file for Spring anti-patterns.",
  {
    filePath: z.string(),
    source: z.string(),
    workspaceRoot: z.string().optional(),
  },
  async ({ filePath, source }) => {
    const violations = scanSource(source, filePath);
    return { content: [{ type: "text" as const, text: formatViolations(violations) }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
