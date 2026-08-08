# Sealmoss security notes

Sealmoss is a **verification gate** in front of Moss Capability trees: it seals on Moss Receipt evidence (simulate, Warning halt, ordered leaf texts ↔ intent). It is not a wallet, custodian, broadcaster, Blockaid-style scanner, key vault, or MEV protector.

## What Sealmoss does

- Builds an unsigned Capability via Moss Registry (`action`)
- Forces Moss `simulate` and fails closed on any Warning / halt
- Aligns ordered Receipt leaf texts (and available structured outcome fields) with a declared intent
- For Kuru swaps, requires an amountOut floor via `expect.minAmountOut` or `expect.estimatedAmountOut` + `params.slippage` (refuses `amountOut > 0` alone)
- Writes a **verified envelope** (`verified-capability.json`) **only** when every gate passes; Capability is nested inside
- On Warning / align_fail / action_fail, writes a **failed-run envelope** (default `failed-run.json`) with `verified: false` and **`capability` always `null`**

## What Sealmoss never does

- Hold, request, or derive private keys
- Sign transactions
- Broadcast to Monad mainnet (or any network)
- Auto-approve spending or change recipients on-chain

## Operator checklist before signing elsewhere

1. Read the pipeline summary: action / simulate / align all OK
2. Read every ordered Receipt leaf text — do assets, amounts, and counterparties match what you meant?
3. Open the Capability JSON and confirm calls match that evidence
4. Only then import the unsigned payload into a wallet / signer you control
5. Prefer a local fork or test funds for first live send experiments (outside Sealmoss scope)

## Demo accounts

Sample intents use a dummy account (`0xccc…`). Simulation does not require funding that address. Do not treat demo outputs as instructions to send real value without your own review.

## Threat model (Playground v1)

| Risk | Mitigation |
| --- | --- |
| Agent skips simulation | Pipeline hard-requires simulate |
| Soft warnings ignored | Any Warning → exit 2, failed-run envelope, `capability: null` |
| Receipt/intent mismatch | Align rules → exit 3, failed-run envelope, `capability: null` |
| Slippage without floor | Kuru align fails (`slippage_floor_missing`) unless min/estimated out declared |
| Accidental mainnet send | No send path in Sealmoss; Web `/api/run` is fixture-only unless `SEALMOSS_WEB_ALLOW_LIVE=1` and `live: true` |
| Key exfiltration via UI | Web UI posts intent JSON only; no key fields |

## Reporting

If you find a verification bypass (a **verified** envelope or nested `capability` despite Warning or failed alignment), open an issue on the Sealmoss repo with a minimal intent JSON and logs.
