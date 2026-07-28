import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SpringProfile } from "../context/spring-context.js";

export type QualityDomain =
  | "architecture"
  | "spring-boot"
  | "rest-api"
  | "data-jpa"
  | "security"
  | "testing"
  | "performance"
  | "anti-patterns"
  | "review-format"
  | "scaffolding"
  | "modernization"
  | "git-conventions";

const SHARED_FILES: Record<QualityDomain, string | null> = {
  architecture: "shared/01-architecture.md",
  "spring-boot": null,
  "rest-api": "shared/03-rest-api.md",
  "data-jpa": "shared/04-data-jpa.md",
  security: "shared/05-security.md",
  testing: "shared/06-testing.md",
  performance: "shared/07-performance.md",
  "anti-patterns": "shared/08-anti-patterns.md",
  "review-format": "shared/09-review-format.md",
  scaffolding: "shared/10-scaffolding.md",
  modernization: "shared/11-modernization.md",
  "git-conventions": "shared/12-git-conventions.md",
};

const PROFILE_BOOT: Record<SpringProfile, string> = {
  boot2: "profiles/boot2/spring-boot.md",
  boot3: "profiles/boot3/spring-boot.md",
};

export const DOMAIN_SUMMARIES: Record<QualityDomain, string> = {
  architecture: "Layering, package boundaries, hexagonal / clean structure",
  "spring-boot": "Boot version profile — config, starters, Jakarta vs javax",
  "rest-api": "Controllers, DTOs, validation, error handling, OpenAPI",
  "data-jpa": "Entities, repositories, transactions, N+1, migrations",
  security: "AuthN/Z, secrets, input validation, OWASP basics",
  testing: "Unit, slice, integration tests; Testcontainers",
  performance: "Caching, pagination, async, connection pools",
  "anti-patterns": "Reject list for reviews and audits",
  "review-format": "PR review output structure and severity",
  scaffolding: "Feature / module generation conventions",
  modernization: "Boot 2→3, Java LTS upgrades, dependency hygiene",
  "git-conventions": "Branch, commit, and PR naming",
};

function readFile(standardsDir: string, rel: string): string {
  const filePath = join(standardsDir, rel);
  if (!existsSync(filePath)) {
    throw new Error(`Standards file missing: ${rel}`);
  }
  return readFileSync(filePath, "utf-8");
}

export function readGuide(
  standardsDir: string,
  domain: QualityDomain,
  profileKey: SpringProfile
): string {
  if (domain === "spring-boot") {
    return readFile(standardsDir, PROFILE_BOOT[profileKey] ?? PROFILE_BOOT.boot3);
  }
  const rel = SHARED_FILES[domain];
  if (!rel) throw new Error(`Unknown domain: ${domain}`);
  return readFile(standardsDir, rel);
}

export function buildReviewBrief(standardsDir: string, profileKey: SpringProfile): string {
  return [
    readGuide(standardsDir, "review-format", profileKey),
    "",
    "---",
    "",
    readGuide(standardsDir, "anti-patterns", profileKey),
  ].join("\n");
}

export function domainsForExtensions(extensions: string[]): QualityDomain[] {
  const domains = new Set<QualityDomain>(["review-format", "anti-patterns"]);
  const ext = extensions.map((e) => e.toLowerCase());

  if (ext.some((e) => [".java", ".kt"].includes(e))) {
    domains.add("architecture");
    domains.add("spring-boot");
    domains.add("rest-api");
    domains.add("data-jpa");
    domains.add("security");
    domains.add("testing");
    domains.add("performance");
  }
  if (ext.some((e) => [".yml", ".yaml", ".properties", ".xml", ".gradle", ".kts"].includes(e))) {
    domains.add("spring-boot");
    domains.add("security");
    domains.add("modernization");
  }
  if (ext.some((e) => e.includes("test") || e.includes("IT"))) {
    domains.add("testing");
  }
  return [...domains];
}

export function buildDiffSections(
  standardsDir: string,
  profileKey: SpringProfile,
  changedExtensions: string[]
): string {
  const domains = domainsForExtensions(changedExtensions);
  return domains
    .map((d) => `## ${d}\n\n${readGuide(standardsDir, d, profileKey)}`)
    .join("\n\n---\n\n");
}

export function explainPattern(
  standardsDir: string,
  profileKey: SpringProfile,
  topic: string
): string {
  const t = topic.toLowerCase();
  const map: Array<{ keys: string[]; domain: QualityDomain }> = [
    { keys: ["layer", "hexagonal", "clean", "package", "architecture"], domain: "architecture" },
    { keys: ["boot", "starter", "jakarta", "actuator", "config"], domain: "spring-boot" },
    { keys: ["rest", "controller", "dto", "api", "openapi", "validation"], domain: "rest-api" },
    { keys: ["jpa", "entity", "repository", "hibernate", "flyway", "liquibase"], domain: "data-jpa" },
    { keys: ["security", "jwt", "oauth", "auth"], domain: "security" },
    { keys: ["test", "mockito", "testcontainers"], domain: "testing" },
    { keys: ["cache", "perf", "n+1", "async"], domain: "performance" },
    { keys: ["migrate", "upgrade", "boot3"], domain: "modernization" },
  ];

  for (const entry of map) {
    if (entry.keys.some((k) => t.includes(k))) {
      return readGuide(standardsDir, entry.domain, profileKey);
    }
  }

  return [
    `No exact match for "${topic}". Available domains:`,
    ...Object.entries(DOMAIN_SUMMARIES).map(([k, v]) => `- **${k}**: ${v}`),
  ].join("\n");
}
