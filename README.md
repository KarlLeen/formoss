# Formoss

**Verifiable Agent trading workbench on [Moss](https://github.com/nishuzumi/moss).**

Moss builds and simulates unsigned Monad Capability trees. Formoss adds the gate Agents often skip:

1. **Simulate is mandatory**
2. **Any Warning stops the flow**
3. **Ordered Receipt leaf texts must align with intent** (approve spender / minAmountOut when declared)
4. Only then is a **verified envelope** written (Capability nested + `sha256` digest)

Formoss **never** holds keys, signs, or broadcasts.

## Quick start (judges)

```bash
git clone --recurse-submodules <this-repo-url> Formoss
cd Formoss
pnpm install --prefer-offline --config.minimumReleaseAge=0
# init submodule (if needed) + build @themoss/* packages Formoss links
bash scripts/setup-moss.sh
pnpm build

# 45s offline demo (no RPC)
pnpm demo:offline    # exit 0 — verified envelope + digest
pnpm demo:warning    # exit 2 — failed-run, capability null
pnpm demo:min-out    # exit 3 — minAmountOut align fail
```

Recording script: [demos/SCRIPT.md](demos/SCRIPT.md).

## Requirements

- Node 22+
- pnpm 10+
- Moss via git submodule at `vendor/moss` (or `scripts/setup-moss.sh`)
- Network only for live simulate / `formoss capture` (default RPC `https://rpc.monad.xyz`)

## Capture live fixtures

```bash
pnpm capture:kuru
# → demos/fixtures/kuru-swap-captured.json
pnpm formoss run --intent demos/swap-mon-usdc.json \
  --fixture demos/fixtures/kuru-swap-captured.json
```

Replace `kuru-swap-ok.json` manually when you want the canned offline demo updated.

## CLI

```bash
pnpm formoss run --intent demos/swap-mon-usdc.json
pnpm formoss run --intent … --fixture … [--verbose] [--json]
pnpm formoss capture --intent demos/swap-mon-usdc.json --out demos/fixtures/kuru-swap-captured.json
```

- Default stdout: pipeline + **failed checks only**
- `--verbose`: full texts + checklist
- `--json`: pure `PipelineResult`
- ok → `--out` (default `verified-capability.json`)
- non-ok → `--fail-out` (default `failed-run.json`); `capability` always `null`

Envelope `digest` hashes `{ intent, texts, align, capability, status, verified }` (canonical JSON). Change evidence → digest changes. Not a signature.

Live RPC: retries/timeouts via `FORMOSS_RPC_RETRIES` (default 2) and `FORMOSS_RPC_TIMEOUT_MS` (default 45000). Discovery failures are labeled `[discovery]` — not align failures.

### Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Verified envelope |
| 2 | Warning / halted |
| 3 | Align fail |
| 4 | Action / discovery / runtime fail |
| 1 | Usage |

## Web UI

```bash
pnpm web
```

Open `http://localhost:5173`. Buttons load happy / align-fail / warning / min-out / approve-bad (fixtures served from `demos/fixtures`).

## Safety

See [SECURITY.md](SECURITY.md).

## Tests

```bash
MOSS_SKIP_E2E=1 pnpm test
pnpm test   # includes optional live simulate
```

## Layout

```text
packages/core   intent → action → simulate → align (rules/*) → present (envelope)
packages/cli    formoss run | capture
packages/web    three-pane UI + fixture buttons
demos/          intents, fixtures, SCRIPT.md
vendor/moss     Moss submodule (@themoss/*)
```

## Relation to Moss

Formoss consumes `@themoss/*` as a **library**. Align rules are table-driven in `packages/core/src/rules/` — not an LLM self-report.
