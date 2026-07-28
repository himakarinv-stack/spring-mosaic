import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export type SpringProfile = "boot2" | "boot3";

export interface SpringContext {
  workspaceRoot: string;
  isMaven: boolean;
  isGradle: boolean;
  springBootVersion: string | null;
  javaVersion: string | null;
  profileKey: SpringProfile;
  modules: string[];
  hasWeb: boolean;
  hasSecurity: boolean;
  hasJpa: boolean;
  hasOpenApi: boolean;
}

function readText(path: string): string | null {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function detectBootVersion(text: string): string | null {
  const patterns = [
    /spring-boot[.-](?:starter-parent|dependencies)[^>]*>[\s\S]*?<version>([\d.]+)<\/version>/i,
    /org\.springframework\.boot['"]?\s*version\s*['"]([\d.]+)['"]/i,
    /springBootVersion\s*=\s*['"]([\d.]+)['"]/i,
    /id\s*\(\s*["']org\.springframework\.boot["']\s*\)\s*version\s*["']([\d.]+)["']/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

function detectJavaVersion(text: string): string | null {
  const patterns = [
    /<java\.version>([\d.]+)<\/java\.version>/i,
    /<maven\.compiler\.(?:source|release)>([\d.]+)<\/maven\.compiler\.(?:source|release)>/i,
    /sourceCompatibility\s*=\s*(?:JavaVersion\.VERSION_)?['"]?(\d+)/i,
    /JavaVersion\.VERSION_(\d+)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

function listModules(root: string): string[] {
  const modules: string[] = [];
  for (const name of ["src/main/java", "backend", "api", "service", "domain"]) {
    if (existsSync(join(root, name))) modules.push(name);
  }
  try {
    for (const entry of readdirSync(root)) {
      const full = join(root, entry);
      if (!statSync(full).isDirectory()) continue;
      if (existsSync(join(full, "pom.xml")) || existsSync(join(full, "build.gradle")) || existsSync(join(full, "build.gradle.kts"))) {
        modules.push(entry);
      }
    }
  } catch {
    /* ignore */
  }
  return [...new Set(modules)];
}

export function detectSpringContext(workspaceRoot: string): SpringContext {
  const pom = readText(join(workspaceRoot, "pom.xml")) ?? "";
  const gradle =
    readText(join(workspaceRoot, "build.gradle")) ??
    readText(join(workspaceRoot, "build.gradle.kts")) ??
    "";
  const props = readText(join(workspaceRoot, "gradle.properties")) ?? "";
  const blob = `${pom}\n${gradle}\n${props}`;

  const isMaven = existsSync(join(workspaceRoot, "pom.xml"));
  const isGradle =
    existsSync(join(workspaceRoot, "build.gradle")) ||
    existsSync(join(workspaceRoot, "build.gradle.kts"));

  const springBootVersion = detectBootVersion(blob);
  const javaVersion = detectJavaVersion(blob);
  const major = springBootVersion ? Number(springBootVersion.split(".")[0]) : 3;
  const profileKey: SpringProfile = major >= 3 ? "boot3" : "boot2";

  const hasWeb = /spring-boot-starter-web|spring-boot-starter-webflux/i.test(blob);
  const hasSecurity = /spring-boot-starter-security|spring-security/i.test(blob);
  const hasJpa = /spring-boot-starter-data-jpa|hibernate/i.test(blob);
  const hasOpenApi = /springdoc|openapi|swagger/i.test(blob);

  return {
    workspaceRoot,
    isMaven,
    isGradle,
    springBootVersion,
    javaVersion,
    profileKey,
    modules: listModules(workspaceRoot),
    hasWeb,
    hasSecurity,
    hasJpa,
    hasOpenApi,
  };
}

export function formatContext(ctx: SpringContext): string {
  return [
    `# Spring / Java workspace context`,
    ``,
    `- **Root**: \`${ctx.workspaceRoot}\``,
    `- **Build**: ${ctx.isMaven ? "Maven" : ctx.isGradle ? "Gradle" : "unknown"}`,
    `- **Spring Boot**: ${ctx.springBootVersion ?? "not detected"} (profile: **${ctx.profileKey}**)`,
    `- **Java**: ${ctx.javaVersion ?? "not detected"}`,
    `- **Modules / paths**: ${ctx.modules.length ? ctx.modules.join(", ") : "none detected"}`,
    `- **Web**: ${ctx.hasWeb}`,
    `- **Security**: ${ctx.hasSecurity}`,
    `- **JPA**: ${ctx.hasJpa}`,
    `- **OpenAPI**: ${ctx.hasOpenApi}`,
  ].join("\n");
}
