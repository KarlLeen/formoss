# Formoss demo script (~45s, offline)

Goal: show Formoss refuses to nest a Capability in a verified envelope unless simulation is clean and Receipt evidence matches intent — without relying on live RPC.

## Prep

```bash
git clone --recurse-submodules <repo-url> Formoss
cd Formoss
# or: git submodule update --init --depth 1
pnpm install --prefer-offline --config.minimumReleaseAge=0
pnpm build
rm -f verified-capability.json failed-run.json
```

## Take (45s)

1. **Problem (0–5s)**  
   “Agents can skip simulation or ignore Receipt evidence. Formoss makes that impossible.”

2. **Verified envelope (5–20s)**  
   ```bash
   pnpm demo:offline
   ```  
   Point at: `envelope: **verified**` → open `verified-capability.json` → `intent` + `texts` + `align` + nested `capability` + `digest`.  
   Say: “Unsigned only. Change any evidence field and the digest changes.”

3. **Warning stop (20–32s)**  
   ```bash
   pnpm demo:warning
   echo $?   # 2
   ```  
   Point at: align skipped, `failed-run.json`, `capability: null`.  
   Say: “Any Warning stops the flow — Agents cannot soft-ignore it.”

4. **Align fail — minOut (32–45s)**  
   ```bash
   pnpm demo:min-out
   echo $?   # 3
   ```  
   Point at: concise failures only (`min_amount_out` / `text_min_amount_out`), still no Capability.  
   Say: “Moss provides evidence. Formoss forces Agents to use it.”

## Optional one-liner

```bash
pnpm demo:offline && pnpm demo:warning; pnpm demo:min-out; true
```
