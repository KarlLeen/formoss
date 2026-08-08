import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseIntent, runPipeline } from "@sealmoss/core";
import {
  loadCatalog,
  readJsonUnderDemos,
  resolveFixture,
} from "./demosIo.js";
import { pageHtml } from "./page.js";
import { assertRunAllowed, webAllowLiveFromEnv } from "./runPolicy.js";

const PORT = Number(process.env.PORT ?? 5173);
const MAX_BODY_BYTES = Number(process.env.SEALMOSS_MAX_BODY ?? 262_144); // 256 KiB
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const DEMOS_DIR = join(REPO_ROOT, "demos");

function readBody(req: IncomingMessage, maxBytes: number): Promise<string> {
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

async function handleRun(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const catalog = loadCatalog(DEMOS_DIR);
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
        ? resolveFixture(DEMOS_DIR, catalog, body.fixture!)
        : undefined;
    const result = await runPipeline({ intent, fixture });
    sendJson(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("exceeds") ? 413 : 400;
    sendJson(res, status, { error: message });
  }
}

function handleCatalog(_req: IncomingMessage, res: ServerResponse): void {
  try {
    const catalog = loadCatalog(DEMOS_DIR);
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
  _req: IncomingMessage,
  res: ServerResponse,
): void {
  try {
    const catalog = loadCatalog(DEMOS_DIR);
    const demo = catalog.demos.find((d) => d.id === id);
    if (!demo) {
      sendJson(res, 404, { error: `unknown demo "${id}"` });
      return;
    }
    const intent = readJsonUnderDemos(DEMOS_DIR, demo.intent);
    sendJson(res, 200, { id: demo.id, fixture: demo.fixture, intent });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "")) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(pageHtml);
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/catalog") {
    handleCatalog(req, res);
    return;
  }
  const demoMatch = /^\/api\/demos\/([^/]+)$/.exec(url.pathname);
  if (req.method === "GET" && demoMatch) {
    handleDemoIntent(decodeURIComponent(demoMatch[1]!), req, res);
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/run") {
    void handleRun(req, res);
    return;
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Sealmoss web on http://localhost:${PORT}`);
  console.log(
    `POST /api/run (max body ${MAX_BODY_BYTES} bytes); fixture-only unless SEALMOSS_WEB_ALLOW_LIVE=1 + live:true`,
  );
});
