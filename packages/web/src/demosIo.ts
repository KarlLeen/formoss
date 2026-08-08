import { readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import {
  parsePipelineFixture,
  type PipelineFixture,
} from "@sealmoss/core";

export type Catalog = {
  demos: readonly {
    id: string;
    label: string;
    intent: string;
    fixture: string;
  }[];
  fixtures: Record<string, string>;
};

export function loadCatalog(demosDir: string): Catalog {
  return JSON.parse(
    readFileSync(join(demosDir, "catalog.json"), "utf8"),
  ) as Catalog;
}

/** Resolve a relative path under demos/; reject `..` escapes. */
export function safeDemoPath(demosDir: string, rel: string): string {
  if (!rel || rel.includes("\0") || rel.includes("..")) {
    throw new Error(`path escapes demos/: ${rel}`);
  }
  const root = resolve(demosDir);
  const full = resolve(demosDir, rel);
  if (full !== root && !full.startsWith(root + sep)) {
    throw new Error(`path escapes demos/: ${rel}`);
  }
  return full;
}

export function readJsonUnderDemos(demosDir: string, rel: string): unknown {
  return JSON.parse(readFileSync(safeDemoPath(demosDir, rel), "utf8")) as unknown;
}

/**
 * Resolve a fixture for POST /api/run:
 * - catalog key (e.g. "offline", "warning")
 * - relative path under demos/ ending in .json (e.g. "fixtures/kuru-swap-ok.json")
 */
export function resolveFixture(
  demosDir: string,
  catalog: Catalog,
  nameOrPath: string,
): PipelineFixture {
  if (!nameOrPath || nameOrPath.includes("\0")) {
    throw new Error(`invalid fixture "${nameOrPath}"`);
  }
  if (nameOrPath.includes("..")) {
    throw new Error(`path escapes demos/: ${nameOrPath}`);
  }

  const fromCatalog = catalog.fixtures[nameOrPath];
  if (fromCatalog) {
    return parsePipelineFixture(readJsonUnderDemos(demosDir, fromCatalog));
  }

  if (nameOrPath.endsWith(".json")) {
    return parsePipelineFixture(readJsonUnderDemos(demosDir, nameOrPath));
  }

  throw new Error(`unknown fixture "${nameOrPath}"`);
}
