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

const STANDARDS_DIR = resolveStandardsDir();

const qualityDomainSchema = z.enum([
  "architecture",
  "spring-boot",
  "rest-api",
  "data-jpa",
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
  version: "0.1.0",
});

function resolveWorkspace(workspaceRoot?: string): string {
  return workspaceRoot ?? process.cwd();
}

server.tool(
  "detect_spring_context",
  "Detect Spring Boot / Java version, build tool, and modules. Call first.",
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
  "Index of Java/Spring quality domains. Call first to discover what to fetch.",
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
  "Deep-dive on a Spring/Java topic (jpa, rest, security, transactions, etc.).",
  {
    topic: z.string().describe("e.g. jpa, rest dto, constructor injection, boot3"),
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
  "Minimal PR review brief: review format + anti-patterns.",
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
    changedExtensions: z.array(z.string()).describe("e.g. ['.java', '.yml', '.xml']"),
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
  "PR review orchestration: changed files, extensions, and review steps.",
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
  "review_architecture",
  "Architecture checklist for a Java/Spring diff.",
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
  "Heuristic scan of Java/Kotlin source for common Spring anti-patterns.",
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
