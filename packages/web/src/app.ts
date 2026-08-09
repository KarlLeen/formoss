import { existsSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseIntent, runPipeline } from "@sealmoss/core";
import {
  loadCatalog,
  readJsonUnderDemos,
  resolveFixture,
} from "./demosIo.js";
import { pageHtml } from "./page.js";
import { pitchHtml } from "./pitch.js";
import { assertRunAllowed, webAllowLiveFromEnv } from "./runPolicy.js";

export const MAX_BODY_BYTES = Number(process.env.SEALMOSS_MAX_BODY ?? 262_144);

/** Prefer SEALMOSS_DEMOS_DIR; else first existing demos/catalog.json near cwd or this module. */
export function resolveDemosDir(): string {
  if (process.env.SEALMOSS_DEMOS_DIR) {
    return resolve(process.env.SEALMOSS_DEMOS_DIR);
  }
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(process.cwd(), "demos"),
    join(process.cwd(), "..", "..", "demos"), // packages/web as cwd
    join(here, "..", "..", "..", "demos"), // packages/web/dist
    join(here, "..", "..", "..", "..", "demos"), // packages/web/dist-test/src
  ];
  for (const dir of candidates) {
    const resolved = resolve(dir);
    if (existsSync(join(resolved, "catalog.json"))) return resolved;
  }
  throw new Error(
    "demos/ not found (expected catalog.json); set SEALMOSS_DEMOS_DIR",
  );
}

export function readBody(req: IncomingMessage, maxBytes: number): Promise<string> {
  return new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer | string) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buf.length;
      if (size > maxBytes) {
        reject(new Error(`Request body exceeds ${maxBytes} bytes`));
        req.destroy();
        return;
      }
      chunks.push(buf);
    });
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function handleRun(
  req: IncomingMessage,
  res: ServerResponse,
  demosDir: string,
): Promise<void> {
  try {
    const catalog = loadCatalog(demosDir);
    const raw = await readBody(req, MAX_BODY_BYTES);
    const body = JSON.parse(raw) as {
      intent?: unknown;
      fixture?: string;
      live?: boolean;
    };
    const mode = assertRunAllowed(
      { fixture: body.fixture, live: body.live === true },
      { allowLive: webAllowLiveFromEnv() },
    );
    const intentRaw = body.intent ?? body;
    const intent = parseIntent(intentRaw);
    const fixture =
      mode.mode === "fixture"
        ? resolveFixture(demosDir, catalog, body.fixture!)
        : undefined;
    const result = await runPipeline({ intent, fixture });
    sendJson(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("exceeds") ? 413 : 400;
    sendJson(res, status, { error: message });
  }
}

function handleCatalog(res: ServerResponse, demosDir: string): void {
  try {
    const catalog = loadCatalog(demosDir);
    sendJson(res, 200, {
      demos: catalog.demos.map((d) => ({
        id: d.id,
        label: d.label,
        fixture: d.fixture,
      })),
      fixtures: Object.keys(catalog.fixtures),
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function handleDemoIntent(
  id: string,
  res: ServerResponse,
  demosDir: string,
): void {
  try {
    const catalog = loadCatalog(demosDir);
    const demo = catalog.demos.find((d) => d.id === id);
    if (!demo) {
      sendJson(res, 404, { error: `unknown demo "${id}"` });
      return;
    }
    const intent = readJsonUnderDemos(demosDir, demo.intent);
    sendJson(res, 200, { id: demo.id, fixture: demo.fixture, intent });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export type DispatchOptions = {
  /** Override pathname when the platform rewrites the URL (e.g. Vercel). */
  pathname?: string;
  demosDir?: string;
};

/**
 * Shared HTTP router for local Node server and Vercel serverless.
 */
export async function dispatch(
  req: IncomingMessage,
  res: ServerResponse,
  options: DispatchOptions = {},
): Promise<void> {
  const demosDir = options.demosDir ?? resolveDemosDir();
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);
  const pathname = options.pathname ?? url.pathname;

  if (req.method === "GET" && (pathname === "/" || pathname === "")) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(pageHtml);
    return;
  }
  if (
    req.method === "GET" &&
    (pathname === "/pitch" || pathname === "/pitch/" || pathname === "/pitch.html")
  ) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(pitchHtml);
    return;
  }
  if (req.method === "GET" && pathname === "/api/catalog") {
    handleCatalog(res, demosDir);
    return;
  }
  const demoMatch = /^\/api\/demos\/([^/]+)$/.exec(pathname);
  if (req.method === "GET" && demoMatch) {
    handleDemoIntent(decodeURIComponent(demoMatch[1]!), res, demosDir);
    return;
  }
  if (req.method === "POST" && pathname === "/api/run") {
    await handleRun(req, res, demosDir);
    return;
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
}
