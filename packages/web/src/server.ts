import { readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseIntent,
  parsePipelineFixture,
  runPipeline,
  type PipelineFixture,
} from "@formoss/core";
import { pageHtml } from "./page.js";

const PORT = Number(process.env.PORT ?? 5173);
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const FIXTURE_FILES: Record<string, string> = {
  warning: "demos/fixtures/simulate-warning.json",
  "min-out": "demos/fixtures/kuru-swap-ok.json",
  "approve-bad": "demos/fixtures/approve-bad-spender.json",
  offline: "demos/fixtures/kuru-swap-ok.json",
};

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function loadFixture(name: string): PipelineFixture {
  const rel = FIXTURE_FILES[name];
  if (!rel) throw new Error(`unknown fixture "${name}"`);
  return parsePipelineFixture(
    JSON.parse(readFileSync(join(REPO_ROOT, rel), "utf8")) as unknown,
  );
}

async function handleRun(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw) as {
      intent?: unknown;
      fixture?: string;
    };
    // Back-compat: bare intent object
    const intentRaw = body.intent ?? body;
    const intent = parseIntent(intentRaw);
    const fixture =
      typeof body.fixture === "string" && body.fixture.length > 0
        ? loadFixture(body.fixture)
        : undefined;
    const result = await runPipeline({ intent, fixture });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(result));
  } catch (error) {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

const server = createServer((req, res) => {
  const url = req.url ?? "/";
  if (req.method === "GET" && (url === "/" || url.startsWith("/?"))) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(pageHtml);
    return;
  }
  if (req.method === "POST" && url === "/api/run") {
    void handleRun(req, res);
    return;
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Formoss web on http://localhost:${PORT}`);
  console.log("Pipeline runs on this server via POST /api/run (same @formoss/core as CLI).");
});
