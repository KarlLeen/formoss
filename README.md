# Sealmoss

**Seal for [Moss](https://github.com/nishuzumi/moss)** — a verifiable Agent trading workbench.

**Moss** turns Monad protocol ops into Agent-callable Capability trees (`discover → load → action → simulate`). It builds and simulates unsigned transactions and emits ordered Receipt evidence — but it does not decide whether an Agent *used* that evidence.

**Sealmoss** is the missing seal: Agents must simulate, stop on Warnings, and align Receipt leaf texts with declared intent before any unsigned Capability is nested in a verified envelope. Moss stays the engine; Sealmoss is the gate that makes skipping evidence hard.

**Hard boundary:** Sealmoss seals on **Moss Receipt evidence** (simulate → Warning halt → ordered leaf texts ↔ intent). It is not a Blockaid-style wallet scanner, not a key vault / signer, and not an MEV protector.

Gates Agents often skip:

1. **Simulate is mandatory**
2. **Any Warning stops the flow**
3. **Ordered Receipt leaf texts must align with intent** (approve spender; Kuru amountOut floor via `expect.minAmountOut` or `estimatedAmountOut` + slippage)
4. Only then is a **verified envelope** written (Capability nested + `sha256` digest); failures still write a **failed-run envelope** with `capability: null`

Sealmoss **never** holds keys, signs, or broadcasts.

## Quick start (judges)

```bash
git clone --recurse-submodules https://github.com/KarlLeen/formoss.git
cd formoss
# product name: Sealmoss (CLI: sealmoss / packages: @sealmoss/*)
pnpm install --prefer-offline --config.minimumReleaseAge=0
# prepare builds Moss packages when vendor/moss exists
# (skip with SEALMOSS_SKIP_PREPARE=1; or run: bash scripts/setup-moss.sh)
pnpm build

# 45s offline demo (no RPC)
pnpm demo:offline    # exit 0 — verified envelope + digest
pnpm demo:warning    # exit 2 — failed-run envelope, capability null
pnpm demo:min-out    # exit 3 — minAmountOut align fail
```

Recording script: [demos/SCRIPT.md](demos/SCRIPT.md).

## Requirements

- Node 22+
- pnpm 10+
- Moss via git submodule at `vendor/moss` (or `scripts/setup-moss.sh`)
- Network only for live simulate / `sealmoss capture` (default RPC `https://rpc.monad.xyz`)

## Capture live fixtures

```bash
pnpm capture:kuru
# → demos/fixtures/kuru-swap-captured.json
pnpm sealmoss run --intent demos/swap-mon-usdc.json \
  --fixture demos/fixtures/kuru-swap-captured.json
```

Replace `kuru-swap-ok.json` manually when you want the canned offline demo updated.

## CLI

```bash
pnpm sealmoss run --intent demos/swap-mon-usdc.json
pnpm sealmoss run --intent … --fixture … [--verbose] [--json]
pnpm sealmoss capture --intent demos/swap-mon-usdc.json --out demos/fixtures/kuru-swap-captured.json
pnpm sealmoss capture --intent … --out … --compare demos/fixtures/kuru-swap-ok.json
pnpm sealmoss capture --intent … --out … --compare … --force-write
pnpm sealmoss verify-envelope verified-capability.json
pnpm sealmoss verify-envelope verified-capability.json --recheck
```

- Default stdout: pipeline + **failed checks only**
- `--verbose`: full texts + checklist
- `--json`: pure `PipelineResult`
- ok → `--out` (default `verified-capability.json`)
- non-ok → `--fail-out` (default `failed-run.json`) — failed-run envelope, `capability` always `null`
- Kuru swaps require `expect.minAmountOut` or `expect.estimatedAmountOut` (with `params.slippage`) so the gate is not `amountOut > 0` alone
- `verify-envelope`: digest + invariants (`verified`/`capability`/`align`); `--recheck` re-runs align (exit `0` / `3`)
- `capture --compare`: diff texts / outcome / warnings / protocol·method / capability; on drift write `<out>.new.json` and **skip** `--out` (exit `3`); `--force-write` also writes `--out`

Envelope `digest` (sha256 over canonical JSON) binds **`{ intent, texts, align, capability, status, verified }`**. Not hashed: `warnings`, `steps`, `createdAt`, `error`, `receiptOutcome`. Change a hashed evidence field → digest changes. Not a signature.

Live RPC: retries/timeouts via `SEALMOSS_RPC_RETRIES` (default 2) and `SEALMOSS_RPC_TIMEOUT_MS` (default 45000). Only **transient** RPC failures (and timeouts) are labeled `[discovery]`; validation/protocol errors are rethrown as-is. Timed-out attempts are ignored if they finish late (Moss has no AbortSignal).

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

Open `http://localhost:5173`. Buttons load happy / align-fail / warning / min-out / approve-bad from `demos/` (always with a fixture).  
`POST /api/run` is **fixture-only** by default. Live RPC requires `SEALMOSS_WEB_ALLOW_LIVE=1` **and** body/UI `live: true`.

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
packages/cli    sealmoss run | capture | verify-envelope
packages/web    three-pane UI + fixture buttons
demos/          intents, fixtures, SCRIPT.md
vendor/moss     Moss submodule (@themoss/*)
```

## Relation to Moss

Sealmoss consumes `@themoss/*` as a **library**. Align rules are table-driven in `packages/core/src/rules/` — not an LLM self-report.
