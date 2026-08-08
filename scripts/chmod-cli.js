import { chmodSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const cli = join(dirname(fileURLToPath(import.meta.url)), "../packages/cli/dist/cli.js");
if (existsSync(cli)) chmodSync(cli, 0o755);
