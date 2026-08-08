# Sealmoss demo script (~45s, offline)

Goal: show Sealmoss refuses to nest a Capability in a verified envelope unless simulation is clean and Receipt evidence matches intent — without relying on live RPC.

## Prep

```bash
git clone --recurse-submodules https://github.com/KarlLeen/formoss.git
cd formoss
pnpm install --prefer-offline --config.minimumReleaseAge=0
bash scripts/setup-moss.sh
pnpm build
rm -f verified-capability.json failed-run.json
```

## Take (45s)

1. **Problem (0–5s)**  
   “Agents can skip simulation or ignore Receipt evidence. Sealmoss makes that impossible.”

2. **Verified envelope (5–20s)**  
   ```bash
   pnpm demo:offline
   ```  
   Point at: `envelope: **verified**` → open `verified-capability.json` → `intent` + `texts` + `align` + nested `capability` + `digest`.  
   Optional: `pnpm sealmoss verify-envelope verified-capability.json` (exit 0).  
   Say: “Unsigned only. Change any evidence field and the digest changes.”

3. **Warning stop (20–32s)**  
   ```bash
   pnpm demo:warning
   echo $?   # 2
   ```  
   Point at: align skipped, failed-run envelope `failed-run.json`, `verified: false`, `capability: null`.  
   Say: “Any Warning stops the flow — Agents cannot soft-ignore it.”

4. **Align fail — minOut (32–45s)**  
   ```bash
   pnpm demo:min-out
   echo $?   # 3
   ```  
   Point at: concise failures only (`min_amount_out` / `text_min_amount_out`), still no Capability.  
   Say: “Moss provides evidence. Sealmoss forces Agents to use it.”

## Optional one-liner

```bash
pnpm demo:offline && pnpm demo:warning; pnpm demo:min-out; true
```
